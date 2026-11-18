import { createHmac, timingSafeEqual } from "node:crypto";

export type MetaInternalEvent = {
  deliveryId: string;
  event: "whatsapp.message" | "whatsapp.status";
  payload: Record<string, unknown>;
};

export function validarAssinaturaMeta(rawBody: string, signature: string | null, appSecret: string): boolean {
  if (!signature || !appSecret || !signature.startsWith("sha256=")) return false;
  const received = Buffer.from(signature.slice("sha256=".length), "hex");
  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest();
  return received.length === expected.length && timingSafeEqual(received, expected);
}

/** Converts Meta's native webhook envelope into the existing idempotent sales-event format. */
export function extrairEventosMeta(payload: any): MetaInternalEvent[] {
  const events: MetaInternalEvent[] = [];
  for (const entry of payload?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      if (change?.field !== "messages") continue;
      const value = change.value ?? {};
      for (const message of value.messages ?? []) {
        if (!message?.id) continue;
        events.push({
          deliveryId: `meta:message:${message.id}`,
          event: "whatsapp.message",
          payload: {
            object: payload.object,
            entry: [{ id: entry.id, changes: [{ field: "messages", value: { ...value, messages: [message], statuses: [] } }] }],
          },
        });
      }
      for (const status of value.statuses ?? []) {
        if (!status?.id || !status?.status) continue;
        events.push({
          deliveryId: `meta:status:${status.id}:${status.status}`,
          event: "whatsapp.status",
          payload: {
            object: payload.object,
            entry: [{ id: entry.id, changes: [{ field: "messages", value: { ...value, messages: [], statuses: [status] } }] }],
          },
        });
      }
    }
  }
  return events;
}
