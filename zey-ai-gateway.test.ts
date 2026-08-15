/**
 * Integration test untuk lib/zey-ai-gateway.ts
 */
import { queryZeyAIGateway } from "@/lib/zey-ai-gateway";
import { fetchWithRetry, UpstreamError } from "@/lib/fetch-with-retry";

jest.mock("@/lib/fetch-with-retry", () => {
  const actual = jest.requireActual("@/lib/fetch-with-retry");
  return {
    ...actual,
    fetchWithRetry: jest.fn(),
  };
});

const mockedFetchWithRetry = fetchWithRetry as jest.MockedFunction<typeof fetchWithRetry>;

const sampleMessages = [
  { role: "system" as const, content: "system prompt" },
  { role: "user" as const, content: "user prompt" },
];

describe("queryZeyAIGateway", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      ZEY_AI_GATEWAY_URL: "https://zey-ai.test/api/chat",
      ZEY_AI_API_KEY: "test-gateway-key",
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("mengembalikan hasil ter-parse ketika gateway merespons JSON string di choices[0].message.content", async () => {
    mockedFetchWithRetry.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ status: "success", topic: "Recursion" }) } }],
      }),
    } as unknown as Response);

    const result = await queryZeyAIGateway(sampleMessages);

    expect(result.parsed).toEqual({ status: "success", topic: "Recursion" });
    expect(mockedFetchWithRetry).toHaveBeenCalledWith(
      "https://zey-ai.test/api/chat",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-api-key": "test-gateway-key",
          Authorization: "Bearer test-gateway-key",
        }),
      })
    );
  });

  it("mengembalikan hasil langsung ketika field content sudah berupa object (bukan string)", async () => {
    mockedFetchWithRetry.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ content: { status: "success", topic: "Direct Object" } }),
    } as unknown as Response);

    const result = await queryZeyAIGateway(sampleMessages);

    expect(result.parsed).toEqual({ status: "success", topic: "Direct Object" });
  });

  it("melempar UpstreamError dengan status yang sesuai ketika gateway merespons gagal", async () => {
    mockedFetchWithRetry.mockResolvedValue({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
      text: async () => "Gateway sedang down",
    } as unknown as Response);

    await expect(queryZeyAIGateway(sampleMessages)).rejects.toMatchObject({ status: 503 });
  });

  it("melempar UpstreamError ketika ZEY_AI_GATEWAY_URL belum dikonfigurasi", async () => {
    process.env.ZEY_AI_GATEWAY_URL = "";

    await expect(queryZeyAIGateway(sampleMessages)).rejects.toBeInstanceOf(UpstreamError);
    expect(mockedFetchWithRetry).not.toHaveBeenCalled();
  });

  it("melempar UpstreamError ketika ZEY_AI_API_KEY belum dikonfigurasi", async () => {
    process.env.ZEY_AI_API_KEY = "";

    await expect(queryZeyAIGateway(sampleMessages)).rejects.toBeInstanceOf(UpstreamError);
    expect(mockedFetchWithRetry).not.toHaveBeenCalled();
  });

  it("melempar UpstreamError ketika fetchWithRetry gagal total (network/timeout)", async () => {
    mockedFetchWithRetry.mockRejectedValue(new UpstreamError("Request timeout"));

    await expect(queryZeyAIGateway(sampleMessages)).rejects.toBeInstanceOf(UpstreamError);
  });
});
