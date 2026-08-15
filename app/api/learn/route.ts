// app/api/learn/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ZEY_LEARN_PROMPT } from "@/lib/system-prompt";
import { fetchSearchContext } from "@/lib/zey-search";
import { saveToZeyVault } from "@/lib/zey-vault";
import { triggerVVVStudioFineTune } from "@/lib/vvv-studio";
import { queryZeyAIGateway } from "@/lib/zey-ai-gateway";
import { UpstreamError } from "@/lib/fetch-with-retry";

const VALID_ACTIONS = ["teach", "feedback"] as const;
type Action = (typeof VALID_ACTIONS)[number];

export async function POST(req: NextRequest) {
  let body: any;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body request harus berupa JSON yang valid." },
      { status: 400 }
    );
  }

  const { topic, action = "teach", feedbackText } = body ?? {};

  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return NextResponse.json({ error: "Parameter 'topic' wajib diisi." }, { status: 400 });
  }

  if (!VALID_ACTIONS.includes(action)) {
    return NextResponse.json(
      { error: `Parameter 'action' harus salah satu dari: ${VALID_ACTIONS.join(", ")}.` },
      { status: 400 }
    );
  }

  if (
    action === "feedback" &&
    (!feedbackText || typeof feedbackText !== "string" || !feedbackText.trim())
  ) {
    return NextResponse.json(
      { error: "Parameter 'feedbackText' wajib diisi untuk action 'feedback'." },
      { status: 400 }
    );
  }

  try {
    // Step 1: Internet Search Enrichment via Zey Search API (best-effort)
    const searchResult = await fetchSearchContext(topic);
    const contextText =
      searchResult.snippets.length > 0
        ? `Referensi Tambahan dari Internet:\n${searchResult.snippets.join("\n")}`
        : "Tidak ada referensi eksternal tambahan.";

    // Step 2: Query Gateway Zey AI
    const userPromptContent =
      (action as Action) === "feedback"
        ? `Topik: "${topic}"\nKoreksi/Feedback Pengguna: "${feedbackText}"\n\n${contextText}\n\nInstruksi: Terapkan Self-Correction, perbaiki penjelasan sesuai feedback.`
        : `Topik: "${topic}"\n\n${contextText}\n\nInstruksi: Ajarkan konsep ini dengan analogi sederhana dan poin-poin penting.`;

    const { parsed: parsedResult } = await queryZeyAIGateway([
      { role: "system", content: ZEY_LEARN_PROMPT },
      { role: "user", content: userPromptContent },
    ]);

    // Step 3: Symbiosis Auto-Save & Fine-Tune Trigger jika action = feedback (best-effort)
    if (action === "feedback") {
      const vaultPayload = {
        topic,
        userPrompt: userPromptContent,
        aiResponse: JSON.stringify(parsedResult),
        userFeedback: feedbackText,
        timestamp: new Date().toISOString(),
      };

      const isVaultSaved = await saveToZeyVault(vaultPayload);
      if (isVaultSaved) {
        await triggerVVVStudioFineTune({
          datasetId: `vault-${Date.now()}`,
          modelTarget: "zey-learn-v1",
        });
      } else {
        console.warn("Gagal menyimpan feedback ke Zey Vault; fine-tune trigger dilewati.");
      }
    }

    return NextResponse.json(parsedResult, { status: 200 });
  } catch (error: any) {
    if (error instanceof UpstreamError) {
      const status =
        error.status && error.status >= 400 && error.status < 600 ? error.status : 502;
      return NextResponse.json({ error: error.message }, { status });
    }

    console.error("Zey Learn API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
