import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Aviso = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
  external_id: z.string().uuid().optional(),
}).passthrough();

// XPag webhooks are unsigned: we treat them only as a hint and confirm with XPag's API before releasing access.
export const Route = createFileRoute("/api/public/xpag/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let json: unknown;
        try { json = await request.json(); } catch { return new Response("Bad JSON", { status: 400 }); }
        const parsed = Aviso.safeParse(json);
        if (!parsed.success) return new Response("Bad payload", { status: 400 });

        const { getDb, confirmarPago, pagamentoValido } = await import("@/lib/vendas/processar.server");
        const { consultarTransacao } = await import("@/lib/vendas/xpag.server");
        const db = await getDb();

        const { data: ev, error } = await db.from("xpag_webhook_events").insert({ payload: json as never }).select("id").single();
        if (error) return new Response("Storage failed", { status: 500 });

        try {
          const extId = parsed.data.external_id;
          if (extId) {
            const { data: order } = await db.from("pix_orders").select("id,amount,status,xpag_transaction_id").eq("id", extId).maybeSingle();
            if (order?.xpag_transaction_id && order.status !== "paid") {
              const c = await consultarTransacao(order.xpag_transaction_id);
              if (pagamentoValido(c, Number(order.amount))) await confirmarPago(db, order.id, c.e2e);
              else if (c.status === "expired") await db.from("pix_orders").update({ status: "expired" }).eq("id", order.id);
            } else if (order?.status === "paid") {
              await confirmarPago(db, order.id, null); // resends link only if it was never sent
            }
          }
          await db.from("xpag_webhook_events").update({ processed_at: new Date().toISOString() }).eq("id", ev.id);
          return new Response("ok");
        } catch (e) {
          console.error("xpag webhook failed", e);
          await db.from("xpag_webhook_events").update({ processing_error: String(e).slice(0, 2000) }).eq("id", ev.id);
          return new Response("Processing failed", { status: 500 });
        }
      },
    },
  },
});
