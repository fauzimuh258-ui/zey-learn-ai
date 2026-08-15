/**
 * Integration test untuk lib/zey-vault.ts
 */
import { saveToZeyVault } from "@/lib/zey-vault";
import { fetchWithRetry } from "@/lib/fetch-with-retry";

jest.mock("@/lib/fetch-with-retry", () => ({
  fetchWithRetry: jest.fn(),
}));

const mockedFetchWithRetry = fetchWithRetry as jest.MockedFunction<typeof fetchWithRetry>;

const samplePayload = {
  topic: "Recursion",
  userPrompt: "Jelaskan recursion",
  aiResponse: "{}",
  userFeedback: "Kurang jelas",
  timestamp: new Date().toISOString(),
};

describe("saveToZeyVault", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      ZEY_VAULT_API_URL: "https://zey-vault.test/api/store",
      ZEY_VAULT_API_KEY: "test-vault-key",
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("mengembalikan true ketika API vault merespons sukses", async () => {
    mockedFetchWithRetry.mockResolvedValue({ ok: true, status: 200 } as Response);

    const result = await saveToZeyVault(samplePayload);

    expect(result).toBe(true);
    expect(mockedFetchWithRetry).toHaveBeenCalledWith(
      "https://zey-vault.test/api/store",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-vault-key" }),
        body: JSON.stringify(samplePayload),
      })
    );
  });

  it("mengembalikan false ketika API vault merespons gagal", async () => {
    mockedFetchWithRetry.mockResolvedValue({ ok: false, status: 500 } as Response);

    const result = await saveToZeyVault(samplePayload);

    expect(result).toBe(false);
  });

  it("mengembalikan false ketika fetchWithRetry melempar error", async () => {
    mockedFetchWithRetry.mockRejectedValue(new Error("Network down"));

    const result = await saveToZeyVault(samplePayload);

    expect(result).toBe(false);
  });

  it("mengembalikan false tanpa memanggil fetch ketika ZEY_VAULT_API_KEY belum dikonfigurasi", async () => {
    process.env.ZEY_VAULT_API_KEY = "";

    const result = await saveToZeyVault(samplePayload);

    expect(result).toBe(false);
    expect(mockedFetchWithRetry).not.toHaveBeenCalled();
  });
});
