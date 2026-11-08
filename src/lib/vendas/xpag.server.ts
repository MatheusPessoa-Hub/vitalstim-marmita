const API_URL = "https://api.xpag.global";

// Direct API call: the connector gateway's Basic auth did not match XPag's credential check.
function headers() {
  const id = process.env["XPAG_CLIENT_ID"];
  const secret = process.env["XPAG_CLIENT_SECRET"];
  if (!id) throw new Error("XPAG_CLIENT_ID is not configured");
  if (!secret) throw new Error("XPAG_CLIENT_SECRET is not configured");
  return { "X-Client-Id": id, "X-Client-Secret": secret, "Content-Type": "application/json" };
}

export type PixCriado = { transactionId: string; copyPaste: string; qrImg: string | null; qrUrl: string | null };

export async function criarPix(input: {
  amount: number; name: string; document: string; externalId: string; webhookUrl: string;
}): Promise<PixCriado> {
  const res = await fetch(`${API_URL}/cashin`, {
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
  const res = await fetch(`${API_URL}/consult-transaction?transaction_id=${encodeURIComponent(transactionId)}`, {
    headers: headers(),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`XPag consult failed [${res.status}]: ${text}`);
  const j = JSON.parse(text);
  return { status: String(j.status ?? ""), amount: Number(j.amount ?? 0), e2e: j.e2e ?? null, type: String(j.type ?? "") };
}
