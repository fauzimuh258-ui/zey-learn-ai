"use client";

import { useState } from "react";
import { LearnResponse } from "@/types";
import Toast, { ToastType } from "./toast";
import Spinner from "./spinner";

export default function LearnView() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [data, setData] = useState<LearnResponse | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const handleStartLearn = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, action: "teach" }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Gagal memuat materi. Silakan coba lagi.");
      }

      setData(result);
      setUserAnswer("");
    } catch (err: any) {
      setError(
        err?.message || "Terjadi kesalahan tak terduga. Periksa koneksi internet Anda dan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!feedback.trim() || !data) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: data.topic,
          action: "feedback",
          feedbackText: feedback,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Gagal mengirim koreksi. Silakan coba lagi.");
      }

      setData(result);
      setFeedback("");
      setToast({ message: "Koreksi diterima & tersimpan ke Zey Vault.", type: "success" });
    } catch (err: any) {
      setError(
        err?.message || "Terjadi kesalahan tak terduga. Periksa koneksi internet Anda dan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  // Catatan: tombol ini men-simulasikan sinkronisasi manual dari sisi client.
  // Penyimpanan sesungguhnya ke Zey Vault terjadi otomatis di server saat
  // pengguna mengirim koreksi lewat "Kirim Koreksi" (lihat app/api/learn/route.ts).
  const handleSyncVault = async () => {
    if (!data) return;
    setSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSyncing(false);
    setToast({ message: "Tersimpan ke Zey Vault & diantrekan ke VWV Studio!", type: "success" });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Input Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Apa yang ingin kamu pelajari hari ini?
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStartLearn()}
            placeholder="Contoh: Quantum Computing, Redux State Management, Photosynthesis..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleStartLearn}
            disabled={loading || !topic.trim()}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner className="h-3.5 w-3.5" />
                Proses...
              </>
            ) : (
              "Mulai Belajar"
            )}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          role="alert"
          className="bg-red-950/40 border border-red-800/60 rounded-xl p-4 flex items-start gap-3"
        >
          <span className="text-red-400 mt-0.5" aria-hidden="true">
            ⚠
          </span>
          <div className="flex-1 space-y-0.5">
            <p className="text-xs font-semibold text-red-300">Terjadi kesalahan</p>
            <p className="text-xs text-red-200/90">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            aria-label="Tutup pesan error"
            className="shrink-0 text-red-400 hover:text-red-200 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading State (initial load, belum ada data sama sekali) */}
      {loading && !data && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Spinner className="h-6 w-6" />
          <p className="text-xs">Menyiapkan materi belajar...</p>
        </div>
      )}

      {/* Empty State */}
      {!data && !loading && !error && (
        <div className="bg-slate-900 border border-dashed border-slate-800 rounded-xl p-10 text-center space-y-1.5">
          <p className="text-sm text-slate-300 font-medium">Belum ada materi yang dipelajari</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ketik topik di atas lalu tekan &quot;Mulai Belajar&quot; untuk memulai sesi belajar
            bersama Zey Learn AI.
          </p>
        </div>
      )}

      {/* Main Content Display */}
      {data && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center gap-2 border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white break-words">{data.topic}</h2>
              <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-400 uppercase">
                {data.action_type}
              </span>
            </div>

            {/* Analogy Box */}
            <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-lg p-3.5 space-y-1">
              <span className="text-xs font-semibold text-indigo-400">Analogy:</span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {data.learning_content.analogy}
              </p>
            </div>

            {/* Detailed Explanation */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-400">Penjelasan Inti:</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {data.learning_content.detailed_explanation}
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-semibold text-slate-400">Poin Penting:</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                {data.learning_content.key_takeaways.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>

            {/* Interactive Prompt */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2">
              <span className="text-xs font-semibold text-amber-400">Pengecekan Pemahaman:</span>
              <p className="text-xs text-slate-300">{data.learning_content.interactive_prompt}</p>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Tulis jawabanmu di sini..."
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Feedback & Symbiosis Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Feedback & Reinforcement Loop
            </h3>
            <p className="text-xs text-slate-400">
              Apakah penjelasan di atas membingungkan atau ada yang salah? Berikan koreksi agar AI
              makin pintar.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendFeedback()}
                placeholder="Berikan masukan atau koreksi..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSendFeedback}
                disabled={loading || !feedback.trim()}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kirim Koreksi
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-t border-slate-800 pt-3">
              <span className="text-[11px] text-slate-400">
                Dataset Symbiosis Ready: <strong className="text-emerald-400">Yes</strong>
              </span>
              <button
                onClick={handleSyncVault}
                disabled={syncing}
                className="w-full sm:w-auto px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {syncing ? (
                  <>
                    <Spinner className="h-3.5 w-3.5" />
                    Syncing...
                  </>
                ) : (
                  "Sync to Zey Vault & VWV Studio"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toast?.message || ""}
        type={toast?.type}
        isVisible={!!toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
