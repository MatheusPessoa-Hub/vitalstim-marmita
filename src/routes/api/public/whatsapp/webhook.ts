import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhookRequest } from "@lovable.dev/webhooks-js";

export const Route = createFileRoute("/api/public/whatsapp/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const deliveryId = request.headers.get("x-lovable-delivery");
        const event = request.headers.get("x-lovable-event");
        let payload: unknown;
        try {
          ({ payload } = await verifyWebhookRequest({
            req: request, secret: process.env["WHATSAPP_API_KEY"], maxBodyBytes: 4 * 1024 * 1024,
          }));
        } catch {
          return new Response("Invalid signature", { status: 401 });
        }
        if (!deliveryId || !event) return new Response("Missing delivery headers", { status: 400 });

        const { getDb, executar, recuperarPendentes } = await import("@/lib/vendas/processar.server");
        const db = await getDb();
        const origin = new URL(request.url).origin;

        const ins = await db.from("whatsapp_webhook_events").upsert(
          { delivery_id: deliveryId, event, payload: payload as never },
          { onConflict: "delivery_id", ignoreDuplicates: true },
        );
        if (ins.error) return new Response("Storage failed", { status: 500 });
        const { data: row, error } = await db.from("whatsapp_webhook_events")
          .select("id,event,payload,processed_at,attempts").eq("delivery_id", deliveryId).single();
        if (error || !row) return new Response("Storage failed", { status: 500 });

        if (!row.processed_at) {
          try {
            await executar(db, row as never, origin);
          } catch {
            return new Response("Processing failed", { status: 500 });
          }
        }
        await recuperarPendentes(db, origin, row.id).catch((e) => console.error("recovery failed", e));
        return new Response("ok");
      },
    },
  },
});
