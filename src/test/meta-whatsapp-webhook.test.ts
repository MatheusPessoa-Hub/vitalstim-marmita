import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { extrairEventosMeta, validarAssinaturaMeta } from "@/lib/vendas/meta-webhook.server";

describe("Meta WhatsApp webhook", () => {
  const body = JSON.stringify({
    object: "whatsapp_business_account",
    entry: [{ id: "waba-1", changes: [{ field: "messages", value: {
      metadata: { phone_number_id: "phone-1" },
      messages: [{ id: "wamid.123", from: "5511999999999", type: "text", text: { body: "Quero comprar" } }],
      statuses: [{ id: "wamid.out", status: "delivered", timestamp: "1790000000", recipient_id: "5511999999999" }],
    } }] }],
  });

  it("validates the Meta HMAC SHA-256 signature", () => {
    const signature = "sha256=" + createHmac("sha256", "secret").update(body).digest("hex");
    expect(validarAssinaturaMeta(body, signature, "secret")).toBe(true);
    expect(validarAssinaturaMeta(body, signature, "wrong-secret")).toBe(false);
    expect(validarAssinaturaMeta(body, null, "secret")).toBe(false);
  });

  it("splits inbound messages and delivery statuses into idempotent events", () => {
    const events = extrairEventosMeta(JSON.parse(body));
    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({ deliveryId: "meta:message:wamid.123", event: "whatsapp.message" });
    expect(events[1]).toMatchObject({ deliveryId: "meta:status:wamid.out:delivered", event: "whatsapp.status" });
  });
});
