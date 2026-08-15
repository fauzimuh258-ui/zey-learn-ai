/**
 * Integration test untuk lib/zey-search.ts
 * Mem-mock fetchWithRetry (lib/fetch-with-retry) sebagai boundary eksternal.
 */
import { fetchSearchContext } from "@/lib/zey-search";
import { fetchWithRetry } from "@/lib/fetch-with-retry";

jest.mock("@/lib/fetch-with-retry", () => ({
  fetchWithRetry: jest.fn(),
}));

const mockedFetchWithRetry = fetchWithRetry as jest.MockedFunction<typeof fetchWithRetry>;

describe("fetchSearchContext", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, ZEY_SEARCH_API_URL: "https://zey-search.test/api/search" };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("mengembalikan snippets yang sudah diformat ketika API merespons sukses", async () => {
    mockedFetchWithRetry.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        searchResults: [
          { title: "Artikel A", snippet: "Ringkasan A" },
          { title: "Artikel B", snippet: "Ringkasan B" },
        ],
      }),
    } as unknown as Response);

    const result = await fetchSearchContext("quantum computing");

    expect(result.query).toBe("quantum computing");
    expect(result.snippets).toEqual(["Artikel A: Ringkasan A", "Artikel B: Ringkasan B"]);
    expect(mockedFetchWithRetry).toHaveBeenCalledWith(
      "https://zey-search.test/api/search",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("mengembalikan array kosong ketika response berstatus gagal (bukan melempar error)", async () => {
    mockedFetchWithRetry.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as unknown as Response);

    const result = await fetchSearchContext("topic gagal");

    expect(result.snippets).toEqual([]);
  });

  it("mengembalikan array kosong ketika fetchWithRetry melempar error (retry habis)", async () => {
    mockedFetchWithRetry.mockRejectedValue(new Error("Semua percobaan retry gagal"));

    const result = await fetchSearchContext("topic offline");

    expect(result.snippets).toEqual([]);
  });

  it("mengembalikan array kosong ketika response tidak memiliki field searchResults", async () => {
    mockedFetchWithRetry.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as unknown as Response);

    const result = await fetchSearchContext("topic kosong");

    expect(result.snippets).toEqual([]);
  });
});
