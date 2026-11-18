import { createFileRoute } from "@tanstack/react-router";
import { extrairEventosMeta, validarAssinaturaMeta } from "@/lib/vendas/meta-webhook.server";

export const Route = createFileRoute("/api/public/meta/whatsapp/webhook")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");
        const expected = process.env["META_VERIFY_TOKEN"];
        if (mode === "subscribe" && expected && token === expected && challenge) {
          return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
        }
        return new Response("Webhook verification failed", { status: 403 });
      },
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const appSecret = process.env["META_APP_SECRET"];
        if (!appSecret || !validarAssinaturaMeta(rawBody, request.headers.get("x-hub-signature-256"), appSecret)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: unknown;
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        const events = extrairEventosMeta(payload);
        if (!events.length) return new Response("ok", { status: 200 });

        const { getDb, executar, recuperarPendentes } = await import("@/lib/vendas/processar.server");
        const db = await getDb();
        const origin = new URL(request.url).origin;

        try {
          for (const event of events) {
            const inserted = await db.from("whatsapp_webhook_events").upsert(
              { delivery_id: event.deliveryId, event: event.event, payload: event.payload as never },
              { onConflict: "delivery_id", ignoreDuplicates: true },
            );
            if (inserted.error) throw new Error(`Webhook storage failed: ${inserted.error.message}`);

            const { data: row, error } = await db.from("whatsapp_webhook_events")
              .select("id,event,payload,processed_at,attempts")
              .eq("delivery_id", event.deliveryId)
              .single();
            if (error || !row) throw new Error(`Webhook event lookup failed: ${error?.message ?? "missing row"}`);
            if (!row.processed_at) await executar(db, row as never, origin);
          }
          await recuperarPendentes(db, origin).catch((error) => console.error("Meta webhook recovery failed", error));
          return new Response("ok", { status: 200 });
        } catch (error) {
          console.error("Meta WhatsApp webhook processing failed", error);
          return new Response("Processing failed", { status: 500 });
        }
      },
    },
  },
});
