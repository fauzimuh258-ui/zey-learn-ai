// lib/zey-ai-gateway.ts
import { fetchWithRetry, UpstreamError } from "./fetch-with-retry";

export interface GatewayMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GatewayResponse {
  raw: any;
  parsed: any;
}

/**
 * Memanggil Zey AI Gateway (chat completion) dan mem-parse hasilnya
 * sebagai JSON sesuai response_format yang diminta.
 */
export async function queryZeyAIGateway(
  messages: GatewayMessage[],
  options: { temperature?: number } = {}
): Promise<GatewayResponse> {
  const gatewayUrl = process.env.ZEY_AI_GATEWAY_URL;
  const apiKey = process.env.ZEY_AI_API_KEY;

  if (!gatewayUrl) {
    throw new UpstreamError("ZEY_AI_GATEWAY_URL belum dikonfigurasi.");
  }
  if (!apiKey) {
    throw new UpstreamError("ZEY_AI_API_KEY belum dikonfigurasi.");
  }

  const payload = {
    messages,
    temperature: options.temperature ?? 0.3,
    response_format: { type: "json_object" },
  };

  let res: Response;
  try {
    res = await fetchWithRetry(gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err instanceof UpstreamError) throw err;
    throw new UpstreamError(`Gagal menghubungi Zey AI Gateway: ${(err as Error).message}`);
  }

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new UpstreamError(
      `Zey AI Gateway Error [${res.status}]: ${errBody || res.statusText}`,
      res.status
    );
  }

  const aiData = await res.json();
  const rawContent = aiData.choices?.[0]?.message?.content ?? aiData.content ?? aiData;

  let parsed: any;
  try {
    parsed = typeof rawContent === "string" ? JSON.parse(rawContent) : rawContent;
  } catch {
    parsed = rawContent;
  }

  return { raw: aiData, parsed };
}
