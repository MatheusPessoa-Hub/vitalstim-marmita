import type { Botao } from "./fluxo";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/whatsapp";

type Db = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];

function headers() {
  const lovable = process.env["LOVABLE_API_KEY"];
  const wa = process.env["WHATSAPP_API_KEY"];
  if (!lovable) throw new Error("LOVABLE_API_KEY is not configured");
  if (!wa) throw new Error("WHATSAPP_API_KEY is not configured");
  return { Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": wa, "Content-Type": "application/json" };
}

async function enviar(db: Db, phone: string, kind: string, conteudo: Record<string, unknown>, replyTo?: string) {
  const res = await fetch(`${GATEWAY_URL}/messages`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: phone, ...conteudo }),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`WhatsApp send failed [${res.status}]: ${body}`);
    const { error } = await db.from("wa_outbound_messages").insert({
      phone, kind, reply_to: replyTo ?? null, status: "failed", error: `[${res.status}] ${body}`.slice(0, 2000),
      failed_at: new Date().toISOString(),
    });
    if (error) console.error("outbound record failed", error);
    throw new Error(`WhatsApp send failed [${res.status}]: ${body}`);
  }
  const waId: string | undefined = JSON.parse(body)?.messages?.[0]?.id;
  const { error } = await db.from("wa_outbound_messages").insert({
    phone, kind, reply_to: replyTo ?? null, wa_message_id: waId ?? null, status: "accepted",
  });
  if (error) throw new Error(`outbound record failed: ${error.message}`);
  if (waId) await db.rpc("wa_apply_statuses", { _wa_message_id: waId });
  return waId;
}

export function enviarTexto(db: Db, phone: string, texto: string, replyTo?: string) {
  return enviar(db, phone, "text", { type: "text", text: { body: texto, preview_url: true } }, replyTo);
}

export function enviarBotoes(db: Db, phone: string, texto: string, botoes: Botao[], replyTo?: string) {
  return enviar(db, phone, "buttons", {
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: texto.slice(0, 1024) },
      action: { buttons: botoes.slice(0, 3).map((b) => ({ type: "reply", reply: { id: b.id, title: b.title.slice(0, 20) } })) },
    },
  }, replyTo);
}

export function enviarImagem(db: Db, phone: string, link: string, legenda: string, replyTo?: string) {
  return enviar(db, phone, "image", { type: "image", image: { link, caption: legenda } }, replyTo);
}

export function enviarVideo(db: Db, phone: string, link: string, legenda: string, replyTo?: string) {
  return enviar(db, phone, "video", { type: "video", video: { link, caption: legenda.slice(0, 1024) } }, replyTo);
}
