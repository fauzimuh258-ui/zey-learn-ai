/**
 * Unit test untuk app/api/learn/route.ts
 */
import { NextRequest } from "next/server";
import { POST } from "@/app/api/learn/route";
import { fetchSearchContext } from "@/lib/zey-search";
import { queryZeyAIGateway } from "@/lib/zey-ai-gateway";
import { saveToZeyVault } from "@/lib/zey-vault";
import { triggerVVVStudioFineTune } from "@/lib/vvv-studio";
import { UpstreamError } from "@/lib/fetch-with-retry";

jest.mock("@/lib/zey-search");
jest.mock("@/lib/zey-ai-gateway");
jest.mock("@/lib/zey-vault");
jest.mock("@/lib/vvv-studio");

const mockedFetchSearchContext = fetchSearchContext as jest.MockedFunction<typeof fetchSearchContext>;
const mockedQueryZeyAIGateway = queryZeyAIGateway as jest.MockedFunction<typeof queryZeyAIGateway>;
const mockedSaveToZeyVault = saveToZeyVault as jest.MockedFunction<typeof saveToZeyVault>;
const mockedTriggerVVVStudioFineTune = triggerVVVStudioFineTune as jest.MockedFunction<
  typeof triggerVVVStudioFineTune
>;

function buildRequest(body: unknown) {
  return new NextRequest("http://localhost/api/learn", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const sampleParsedResult = {
  status: "success",
  topic: "Recursion",
  action_type: "teach",
  learning_content: {
    summary: "Ringkasan",
    analogy: "Matryoshka",
    detailed_explanation: "Penjelasan",
    key_takeaways: ["A", "B"],
    interactive_prompt: "Pertanyaan?",
  },
  symbiosis_dataset: {
    user_feedback_received: null,
    correction_applied: null,
    ready_for_vault: true,
  },
};

describe("POST /api/learn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetchSearchContext.mockResolvedValue({ query: "Recursion", snippets: [] });
    mockedQueryZeyAIGateway.mockResolvedValue({ raw: {}, parsed: sampleParsedResult });
    mockedSaveToZeyVault.mockResolvedValue(true);
    mockedTriggerVVVStudioFineTune.mockResolvedValue(true);
  });

  it("mengembalikan 400 ketika body bukan JSON valid", async () => {
    const req = new NextRequest("http://localhost/api/learn", {
      method: "POST",
      body: "bukan-json{{{",
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBeDefined();
  });

  it("mengembalikan 400 ketika parameter 'topic' kosong", async () => {
    const res = await POST(buildRequest({ action: "teach" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/topic/i);
  });

  it("mengembalikan 400 ketika 'action' tidak valid", async () => {
    const res = await POST(buildRequest({ topic: "Recursion", action: "invalid" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/action/i);
  });

  it("mengembalikan 400 ketika action 'feedback' tanpa feedbackText", async () => {
    const res = await POST(buildRequest({ topic: "Recursion", action: "feedback" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/feedbackText/i);
  });

  it("berhasil mengajarkan topik baru (action: teach) dan mengembalikan status 200", async () => {
    const res = await POST(buildRequest({ topic: "Recursion", action: "teach" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual(sampleParsedResult);
    expect(mockedFetchSearchContext).toHaveBeenCalledWith("Recursion");
    expect(mockedQueryZeyAIGateway).toHaveBeenCalled();
    expect(mockedSaveToZeyVault).not.toHaveBeenCalled();
  });

  it("menyimpan ke Zey Vault & memicu fine-tune ketika action: feedback", async () => {
    const res = await POST(
      buildRequest({ topic: "Recursion", action: "feedback", feedbackText: "Kurang jelas" })
    );

    expect(res.status).toBe(200);
    expect(mockedSaveToZeyVault).toHaveBeenCalledTimes(1);
    expect(mockedTriggerVVVStudioFineTune).toHaveBeenCalledTimes(1);
  });

  it("tidak memicu fine-tune ketika penyimpanan ke Zey Vault gagal", async () => {
    mockedSaveToZeyVault.mockResolvedValue(false);

    const res = await POST(
      buildRequest({ topic: "Recursion", action: "feedback", feedbackText: "Kurang jelas" })
    );

    expect(res.status).toBe(200);
    expect(mockedTriggerVVVStudioFineTune).not.toHaveBeenCalled();
  });

  it("mengembalikan status dari UpstreamError ketika Zey AI Gateway gagal", async () => {
    mockedQueryZeyAIGateway.mockRejectedValue(new UpstreamError("Zey AI Gateway Error [503]", 503));

    const res = await POST(buildRequest({ topic: "Recursion", action: "teach" }));
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.error).toMatch(/Zey AI Gateway/);
  });

  it("mengembalikan 502 ketika UpstreamError tidak memiliki status (network/timeout)", async () => {
    mockedQueryZeyAIGateway.mockRejectedValue(new UpstreamError("Request timeout"));

    const res = await POST(buildRequest({ topic: "Recursion", action: "teach" }));

    expect(res.status).toBe(502);
  });

  it("mengembalikan 500 ketika terjadi error tak terduga", async () => {
    mockedQueryZeyAIGateway.mockRejectedValue(new Error("Unexpected crash"));

    const res = await POST(buildRequest({ topic: "Recursion", action: "teach" }));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("Unexpected crash");
  });

  it("tetap berhasil mengajarkan meskipun Zey Search API gagal (graceful degradation)", async () => {
    mockedFetchSearchContext.mockResolvedValue({ query: "Recursion", snippets: [] });

    const res = await POST(buildRequest({ topic: "Recursion", action: "teach" }));

    expect(res.status).toBe(200);
  });
});
