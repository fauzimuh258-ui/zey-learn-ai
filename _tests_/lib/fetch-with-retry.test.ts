/**
 * Unit test untuk lib/fetch-with-retry.ts
 */
import { fetchWithRetry, UpstreamError } from "@/lib/fetch-with-retry";

describe("fetchWithRetry", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("mengembalikan response langsung ketika request sukses di percobaan pertama", async () => {
    const mockResponse = { ok: true, status: 200 } as Response;
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const res = await fetchWithRetry(
      "https://example.com/api",
      {},
      { retries: 2, backoffMs: 1 }
    );

    expect(res).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("retry pada status yang termasuk retryOn, lalu sukses di percobaan berikutnya", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, status: 200 });

    const res = await fetchWithRetry(
      "https://example.com/api",
      {},
      { retries: 2, backoffMs: 1 }
    );

    expect(res.ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("tidak retry pada status client error yang tidak ada di retryOn (mis. 400)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 400 });

    const res = await fetchWithRetry(
      "https://example.com/api",
      {},
      { retries: 2, backoffMs: 1 }
    );

    expect(res.status).toBe(400);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("melempar UpstreamError setelah semua percobaan gagal karena network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network down"));

    await expect(
      fetchWithRetry("https://example.com/api", {}, { retries: 2, backoffMs: 1 })
    ).rejects.toBeInstanceOf(UpstreamError);

    expect(global.fetch).toHaveBeenCalledTimes(3); // percobaan awal + 2 retry
  });

  it("melempar UpstreamError dengan pesan timeout ketika request di-abort", async () => {
    (global.fetch as jest.Mock).mockImplementation(() => {
      const err: any = new Error("The operation was aborted");
      err.name = "AbortError";
      return Promise.reject(err);
    });

    await expect(
      fetchWithRetry("https://example.com/api", {}, { retries: 0, backoffMs: 1, timeoutMs: 5 })
    ).rejects.toThrow(/timeout/);
  });
});
