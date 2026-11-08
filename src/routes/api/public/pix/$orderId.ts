import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Serves the Pix QR image for WhatsApp; the order id is an unguessable UUID and no personal data is returned.
export const Route = createFileRoute("/api/public/pix/$orderId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!z.string().uuid().safeParse(params.orderId).success) return new Response("Not found", { status: 404 });
        const { getDb } = await import("@/lib/vendas/processar.server");
        const db = await getDb();
        const { data } = await db.from("pix_orders").select("qr_img,status").eq("id", params.orderId).maybeSingle();
        const qr = data?.qr_img;
        if (!qr || data.status !== "pending") return new Response("Not found", { status: 404 });
        if (qr.startsWith("http")) return Response.redirect(qr, 302);
        const m = qr.match(/^data:(image\/[a-z]+);base64,(.+)$/);
        if (!m) return new Response("Not found", { status: 404 });
        const bytes = Uint8Array.from(atob(m[2] ?? ""), (c) => c.charCodeAt(0));
        return new Response(bytes, { headers: { "Content-Type": m[1] ?? "image/png", "Cache-Control": "private, max-age=600" } });
      },
    },
  },
});
