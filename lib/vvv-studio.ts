// lib/vvv-studio.ts
import { fetchWithRetry } from "./fetch-with-retry";

export interface FineTuneTriggerPayload {
  datasetId: string;
  modelTarget: string;
}

/**
 * Memicu fine-tuning job di VWV Studio (Vazi Web Vision) setelah dataset
 * symbiosis berhasil disimpan ke Zey Vault.
 *
 * Catatan: env var diselaraskan ke VWV_STUDIO_API_URL (kode sebelumnya
 * memakai VVV_STUDIO_API_URL, tidak sinkron dengan daftar environment
 * variables yang diminta).
 */
export async function triggerVVVStudioFineTune(
  payload: FineTuneTriggerPayload
): Promise<boolean> {
  const vwvStudioUrl =
    process.env.VWV_STUDIO_API_URL || "https://vwv-studio.vercel.app/api/finetune";
  const apiKey = process.env.ZEY_AI_API_KEY;

  if (!apiKey) {
    console.error("VWV Studio trigger error: ZEY_AI_API_KEY belum dikonfigurasi.");
    return false;
  }

  try {
    const res = await fetchWithRetry(vwvStudioUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (error) {
    console.error("VWV Studio trigger error:", error);
    return false;
  }
}
