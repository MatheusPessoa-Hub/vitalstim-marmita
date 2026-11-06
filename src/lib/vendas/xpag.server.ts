const GATEWAY_URL = "https://connector-gateway.lovable.dev/udc_xpag";

function headers() {
  const lovable = process.env["LOVABLE_API_KEY"];
  const key = process.env["UDC_XPAG_API_KEY"];
  if (!lovable) throw new Error("LOVABLE_API_KEY is not configured");
  if (!key) throw new Error("UDC_XPAG_API_KEY is not configured");
  return { Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": key, "Content-Type": "application/json" };
}

export type PixCriado = { transactionId: string; copyPaste: string; qrImg: string | null; qrUrl: string | null };

export async function criarPix(input: {
  amount: number; name: string; document: string; externalId: string; webhookUrl: string;
}): Promise<PixCriado> {
  const res = await fetch(`${GATEWAY_URL}/cashin`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      currency: "BRL",
      amount: input.amount,
      name: input.name,
      document: input.document,
      description: "VitalStim - acesso vitalício",
      external_id: input.externalId,
      webhook_url: input.webhookUrl,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`XPag cashin failed [${res.status}]: ${text}`);
  const j = JSON.parse(text);
  const copyPaste = j.copyPaste ?? j.copy_paste ?? j.code;
  const transactionId = j.transaction_id ?? j.request_number;
  if (!j.ok || !copyPaste || !transactionId) throw new Error(`XPag cashin unexpected: ${text.slice(0, 500)}`);
  return { transactionId, copyPaste, qrImg: j.qr_img ?? null, qrUrl: j.qr_url ?? null };
}

export type Consulta = { status: string; amount: number; e2e: string | null; type: string };

export async function consultarTransacao(transactionId: string): Promise<Consulta> {
  const res = await fetch(`${GATEWAY_URL}/consult-transaction?transaction_id=${encodeURIComponent(transactionId)}`, {
    headers: headers(),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`XPag consult failed [${res.status}]: ${text}`);
  const j = JSON.parse(text);
  return { status: String(j.status ?? ""), amount: Number(j.amount ?? 0), e2e: j.e2e ?? null, type: String(j.type ?? "") };
}
