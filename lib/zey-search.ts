// lib/zey-search.ts
import { fetchWithRetry } from "./fetch-with-retry";

export interface SearchContext {
  query: string;
  snippets: string[];
}

/**
 * Mengambil konteks internet tambahan dari Zey Search.
 * Selalu "best-effort": jika gagal (network/status error), kembalikan
 * snippets kosong alih-alih melempar error, supaya alur belajar utama
 * tetap bisa berjalan tanpa referensi tambahan.
 */
export async function fetchSearchContext(query: string): Promise<SearchContext> {
  const searchApiUrl =
    process.env.ZEY_SEARCH_API_URL || "https://zey-search.vercel.app/api/search";

  try {
    const res = await fetchWithRetry(searchApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      console.warn(`Zey Search API warning: Status ${res.status}`);
      return { query, snippets: [] };
    }

    const data = await res.json();
    const snippets =
      data.searchResults?.map((item: any) => `${item.title}: ${item.snippet}`) || [];
    return { query, snippets };
  } catch (error) {
    console.error("Zey Search integration error:", error);
    return { query, snippets: [] };
  }
}
