/**
 * Integration test untuk lib/vvv-studio.ts
 */
import { triggerVVVStudioFineTune } from "@/lib/vvv-studio";
import { fetchWithRetry } from "@/lib/fetch-with-retry";

jest.mock("@/lib/fetch-with-retry", () => ({
  fetchWithRetry: jest.fn(),
}));

const mockedFetchWithRetry = fetchWithRetry as jest.MockedFunction<typeof fetchWithRetry>;

const samplePayload = { datasetId: "vault-123", modelTarget: "zey-learn-v1" };

describe("triggerVVVStudioFineTune", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      VWV_STUDIO_API_URL: "https://vwv-studio.test/api/finetune",
      ZEY_AI_API_KEY: "test-gateway-key",
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("mengembalikan true ketika trigger fine-tune sukses", async () => {
    mockedFetchWithRetry.mockResolvedValue({ ok: true, status: 200 } as Response);

    const result = await triggerVVVStudioFineTune(samplePayload);

    expect(result).toBe(true);
    expect(mockedFetchWithRetry).toHaveBeenCalledWith(
      "https://vwv-studio.test/api/finetune",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-gateway-key" }),
      })
    );
  });

  it("mengembalikan false ketika API merespons gagal", async () => {
    mockedFetchWithRetry.mockResolvedValue({ ok: false, status: 503 } as Response);

    const result = await triggerVVVStudioFineTune(samplePayload);

    expect(result).toBe(false);
  });

  it("mengembalikan false ketika fetchWithRetry melempar error", async () => {
    mockedFetchWithRetry.mockRejectedValue(new Error("Timeout"));

    const result = await triggerVVVStudioFineTune(samplePayload);

    expect(result).toBe(false);
  });

  it("mengembalikan false tanpa memanggil fetch ketika ZEY_AI_API_KEY belum dikonfigurasi", async () => {
    process.env.ZEY_AI_API_KEY = "";

    const result = await triggerVVVStudioFineTune(samplePayload);

    expect(result).toBe(false);
    expect(mockedFetchWithRetry).not.toHaveBeenCalled();
  });
});
