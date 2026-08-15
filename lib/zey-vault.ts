// lib/zey-vault.ts
import { fetchWithRetry } from "./fetch-with-retry";

export interface SymbiosisDatasetPayload {
  topic: string;
  userPrompt: string;
  aiResponse: string;
  userFeedback: string;
  timestamp: string;
}

/**
 * Menyimpan payload dataset symbiosis (feedback & koreksi user) ke Zey Vault.
 * Mengembalikan boolean alih-alih melempar error, karena kegagalan sync
 * tidak seharusnya membatalkan respon utama yang sudah diterima user.
 */
export async function saveToZeyVault(payload: SymbiosisDatasetPayload): Promise<boolean> {
  const vaultApiUrl = process.env.ZEY_VAULT_API_URL || "https://zey-vault.vercel.app/api/store";
  const apiKey = process.env.ZEY_VAULT_API_KEY;

  if (!apiKey) {
    console.error("Zey Vault sync error: ZEY_VAULT_API_KEY belum dikonfigurasi.");
    return false;
  }

  try {
    const res = await fetchWithRetry(vaultApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (error) {
    console.error("Zey Vault sync error:", error);
    return false;
  }
}
