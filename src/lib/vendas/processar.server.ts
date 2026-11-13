import { PRECO } from "@/lib/checkout";
import { BOTOES, TEXTOS, proximoPasso, type Estado } from "./fluxo";
import { enviarBotoes, enviarImagem, enviarTexto, enviarVideo } from "./whatsapp.server";

const VIDEO_CONHECER = "/__l5e/assets-v1/9ce13914-2c48-44c6-916a-01ba4bd5d474/conhecer-app.mp4";
import { consultarTransacao, criarPix } from "./xpag.server";

export async function getDb() {
  return (await import("@/integrations/supabase/client.server")).supabaseAdmin;
}
type Db = Awaited<ReturnType<typeof getDb>>;

type EventRow = { id: string; event: string; payload: any; processed_at: string | null; attempts: number };

const tsFromUnix = (s?: string) => (s ? new Date(Number(s) * 1000).toISOString() : null);

function must<T extends { error: any; data?: any }>(r: T, ctx: string): T & { data: NonNullable<T["data"]> } {
  if (r.error) throw new Error(`${ctx}: ${r.error.message}`);
  return r as T & { data: NonNullable<T["data"]> };
}

export async function processarEvento(db: Db, row: EventRow, origin: string) {
  const value = row.payload?.entry?.[0]?.changes?.[0]?.value ?? {};
  if (row.event === "whatsapp.message") {
    for (const m of value.messages ?? []) await processarMensagem(db, m, origin);
  } else if (row.event === "whatsapp.status") {
    for (const s of value.statuses ?? []) {
      must(await db.from("wa_message_statuses").upsert({
        wa_message_id: s.id, status: s.status, provider_timestamp: tsFromUnix(s.timestamp),
        recipient_id: s.recipient_id ?? null, errors: s.errors ?? null,
      }, { onConflict: "wa_message_id,status", ignoreDuplicates: true }), "status insert");
      // Backfill a missing provider timestamp without replacing an established one.
      if (s.timestamp) {
        must(await db.from("wa_message_statuses").update({ provider_timestamp: tsFromUnix(s.timestamp) })
          .eq("wa_message_id", s.id).eq("status", s.status).is("provider_timestamp", null), "status backfill");
      }
      must(await db.rpc("wa_apply_statuses", { _wa_message_id: s.id }), "apply statuses");
    }
  }
  // Other event types are stored in the inbox and acknowledged.
}

async function processarMensagem(db: Db, m: any, origin: string) {
  const phone: string = m.from;
  const texto: string | undefined = m.text?.body;
  const botaoId: string | undefined = m.interactive?.button_reply?.id ?? m.button?.payload;

  must(await db.from("wa_inbound_messages").upsert({
    wa_message_id: m.id, phone, message_type: m.type, body: texto ?? m.interactive?.button_reply?.title ?? null,
    media_id: m.image?.id ?? m.document?.id ?? m.audio?.id ?? m.video?.id ?? m.sticker?.id ?? null,
    provider_timestamp: tsFromUnix(m.timestamp),
  }, { onConflict: "wa_message_id", ignoreDuplicates: true }), "inbound insert");

  const { data: inbound } = must(await db.from("wa_inbound_messages").select("reply_status").eq("wa_message_id", m.id).single(), "inbound read");
  if (inbound.reply_status === "done" || inbound.reply_status === "unresolved") return;
  if (inbound.reply_status === "sending") {
    // A previous attempt may have sent part of the reply; do not blindly resend.
    try {
      if (await retomarPix(db, phone, origin, m.id)) {
        must(await db.from("wa_inbound_messages").update({ reply_status: "done" }).eq("wa_message_id", m.id), "reply done");
        return;
      }
    } catch (e) {
      console.error("retomarPix failed", e);
    }
    must(await db.from("wa_inbound_messages").update({ reply_status: "unresolved" }).eq("wa_message_id", m.id), "mark unresolved");
    return;
  }
  must(await db.from("wa_inbound_messages").update({ reply_status: "sending" }).eq("wa_message_id", m.id), "claim reply");

  try {
    must(await db.from("wa_conversations").upsert({ phone }, { onConflict: "phone", ignoreDuplicates: true }), "conv upsert");
    const { data: conv } = must(await db.from("wa_conversations").select("*").eq("phone", phone).single(), "conv read");

    const r = proximoPasso(conv.state as Estado, { botaoId, texto });
    const patch: { state: string; updated_at: string; customer_name?: string; document?: string } = { state: r.estado, updated_at: new Date().toISOString() };
    if (r.nome) patch.customer_name = r.nome;
    if (r.cpf) patch.document = r.cpf;
    must(await db.from("wa_conversations").update(patch).eq("phone", phone), "conv update");

    for (const a of r.acoes) {
      if (a.tipo === "texto") await enviarTexto(db, phone, a.texto, m.id);
      else if (a.tipo === "botoes") await enviarBotoes(db, phone, a.texto, a.botoes, m.id);
      else if (a.tipo === "video") await enviarVideo(db, phone, `${origin}${VIDEO_CONHECER}`, a.legenda, m.id);
      else if (a.tipo === "gerar_pix") await gerarPix(db, phone, conv.customer_name ?? "", r.cpf!, origin, m.id);
      else if (a.tipo === "conferir_pix") await conferirPix(db, phone, conv.current_order_id, m.id);
    }
    must(await db.from("wa_inbound_messages").update({ reply_status: "done", reply_error: null }).eq("wa_message_id", m.id), "reply done");
  } catch (e) {
    await db.from("wa_inbound_messages").update({ reply_status: "failed", reply_error: String(e).slice(0, 2000) }).eq("wa_message_id", m.id);
    throw e;
  }
}

// Copy-paste goes first: it is the essential part and must arrive even if the
// request is cut short while the slower QR image is being sent.
async function enviarCodigoPix(db: Db, phone: string, orderId: string, copyPaste: string, origin: string, replyTo: string) {
  // Atomic claim: only one attempt (original or webhook retry) may send the code.
  // A stale claim (>5 min, sender died) may be retaken by recovery.
  const limite = new Date(Date.now() - 5 * 60_000).toISOString();
  const { data: claim } = must(await db.from("pix_orders").update({ code_claimed_at: new Date().toISOString() })
    .eq("id", orderId).or(`code_claimed_at.is.null,code_claimed_at.lt.${limite}`).select("id"), "code claim");
  if (!claim?.length) return;
  await enviarTexto(db, phone, "Copie o código *Pix copia e cola* abaixo e cole no app do seu banco:", replyTo);
  await enviarTexto(db, phone, copyPaste, replyTo);
  await enviarBotoes(db, phone, "Assim que o pagamento cair, te envio o link do app aqui automaticamente. O Pix vale por 24 horas.", [BOTOES.jaPaguei, BOTOES.novoPix], replyTo);
  try {
    await enviarImagem(db, phone, `${origin}/api/public/pix/${orderId}`, "📲 Ou escaneie o QR Code no app do seu banco.", replyTo);
  } catch (e) {
    console.error("QR image send failed; copy-paste already sent", e);
  }
}

// A retry found a reply cut short mid-send. If a Pix already exists, resend its code.
async function retomarPix(db: Db, phone: string, origin: string, replyTo: string) {
  const { data: conv } = await db.from("wa_conversations").select("state,current_order_id").eq("phone", phone).single();
  if (conv?.state !== "aguardando_pix" || !conv.current_order_id) return false;
  const { data: order } = await db.from("pix_orders").select("id,status,copy_paste").eq("id", conv.current_order_id).single();
  if (!order || order.status !== "pending" || !order.copy_paste) return false;
  await enviarCodigoPix(db, phone, order.id, order.copy_paste, origin, replyTo);
  return true;
}

async function gerarPix(db: Db, phone: string, nome: string, cpf: string, origin: string, replyTo: string) {
  const { data: order } = must(await db.from("pix_orders").insert({
    phone, customer_name: nome, document: cpf, amount: PRECO,
  }).select("id").single(), "order insert");

  try {
    const pix = await criarPix({
      amount: PRECO, name: nome, document: cpf, externalId: order.id,
      webhookUrl: `${origin}/api/public/xpag/webhook`,
    });
    must(await db.from("pix_orders").update({
      status: "pending", xpag_transaction_id: pix.transactionId, copy_paste: pix.copyPaste,
      qr_img: pix.qrImg ?? pix.qrUrl, updated_at: new Date().toISOString(),
    }).eq("id", order.id), "order update");
    must(await db.from("wa_conversations").update({ current_order_id: order.id }).eq("phone", phone), "conv order");

    await enviarCodigoPix(db, phone, order.id, pix.copyPaste, origin, replyTo);
  } catch (e) {
    const { data: atual } = await db.from("pix_orders").select("xpag_transaction_id").eq("id", order.id).single();
    if (atual?.xpag_transaction_id) {
      // Pix was created; only the WhatsApp send failed. Keep the order payable.
      await db.from("wa_conversations").update({ state: "aguardando_pix" }).eq("phone", phone);
      throw e;
    }
    await db.from("pix_orders").update({ status: "error", error: String(e).slice(0, 2000) }).eq("id", order.id);
    await db.from("wa_conversations").update({ state: "pedir_cpf" }).eq("phone", phone);
    await enviarTexto(db, phone, "Tive um problema para gerar seu Pix agora. 😔 Envie seu CPF de novo em alguns minutos para eu tentar outra vez.", replyTo);
  }
}

async function conferirPix(db: Db, phone: string, orderId: string | null, replyTo: string) {
  if (!orderId) {
    await enviarBotoes(db, phone, "Não encontrei um Pix seu por aqui. Quer gerar um?", [BOTOES.comprar], replyTo);
    return;
  }
  const { data: order } = must(await db.from("pix_orders").select("*").eq("id", orderId).single(), "order read");
  if (order.status === "paid") return confirmarPago(db, order.id, order.e2e);
  if (order.xpag_transaction_id) {
    const c = await consultarTransacao(order.xpag_transaction_id);
    if (pagamentoValido(c, Number(order.amount))) return confirmarPago(db, order.id, c.e2e);
    if (c.status === "expired") {
      await enviarBotoes(db, phone, "Esse Pix venceu. Gere um novo para concluir a compra:", [BOTOES.novoPix], replyTo);
      return;
    }
  }
  await enviarBotoes(db, phone, "Ainda não identifiquei o pagamento. Pode levar alguns instantes — assim que cair, te aviso aqui. 😉", [BOTOES.jaPaguei, BOTOES.novoPix], replyTo);
}

export function pagamentoValido(c: { status: string; amount: number; type?: string }, esperado: number) {
  return (c.status === "confirmed" || c.status === "completed") && c.amount + 0.001 >= esperado && (!c.type || c.type === "cashin");
}

/** Marks the order as paid once and sends the app link once. */
export async function confirmarPago(db: Db, orderId: string, e2e: string | null) {
  must(await db.from("pix_orders").update({
    status: "paid", e2e, paid_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq("id", orderId).neq("status", "paid"), "order paid");
  const { data: order } = must(await db.from("pix_orders").select("*").eq("id", orderId).single(), "order read");
  if (order.link_sent_at) return;
  await enviarTexto(db, order.phone, TEXTOS.acessoLiberado());
  must(await db.from("pix_orders").update({ link_sent_at: new Date().toISOString() }).eq("id", orderId), "link sent");
  must(await db.from("wa_conversations").update({ state: "pago" }).eq("phone", order.phone), "conv paid");
}

/** Bounded recovery of unfinished webhook rows, fair by next_attempt_at. */
export async function recuperarPendentes(db: Db, origin: string, excluirId?: string) {
  const agora = new Date();
  const { data: rows } = await db.from("whatsapp_webhook_events").select("id,event,payload,processed_at,attempts")
    .is("processed_at", null).lte("next_attempt_at", agora.toISOString())
    .lt("received_at", new Date(agora.getTime() - 30_000).toISOString())
    .order("next_attempt_at", { ascending: true }).limit(3);
  for (const row of rows ?? []) {
    if (row.id === excluirId) continue;
    await executar(db, row as EventRow, origin).catch(() => {});
  }
}

export async function executar(db: Db, row: EventRow, origin: string) {
  const tentativas = row.attempts + 1;
  // Lease the row so concurrent calls do not pick it up at the same time.
  must(await db.from("whatsapp_webhook_events").update({
    attempts: tentativas, next_attempt_at: new Date(Date.now() + Math.min(60, 2 ** tentativas) * 60_000).toISOString(),
  }).eq("id", row.id), "lease");
  try {
    await processarEvento(db, row, origin);
    must(await db.from("whatsapp_webhook_events").update({ processed_at: new Date().toISOString(), processing_error: null }).eq("id", row.id), "processed");
  } catch (e) {
    console.error("whatsapp event failed", row.id, e);
    await db.from("whatsapp_webhook_events").update({ processing_error: String(e).slice(0, 2000) }).eq("id", row.id);
    throw e;
  }
}
