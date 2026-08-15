"use client";

import { useState } from "react";

export default function ReviewView() {
  const [reviews] = useState([
    {
      id: "1",
      topic: "Quantum Computing",
      original: "Fungsi qubits sama seperti bit klasik yaitu 0 dan 1.",
      correction: "Qubits dapat berada dalam status 0, 1, atau keduanya sekaligus (Superposisi).",
      status: "Synced to Zey Vault",
    },
    {
      id: "2",
      topic: "Recursion",
      original: "Rekursi adalah perulangan menggunakan for loop.",
      correction: "Rekursi adalah fungsi yang memanggil dirinya sendiri sampai base case tercapai.",
      status: "Queued for VVV Studio",
    },
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h2 className="text-sm font-bold text-white mb-1">Symbiosis Feedback History</h2>
        <p className="text-xs text-slate-400">
          Daftar umpan balik dan koreksi dari pengguna yang telah dikonversi menjadi dataset fine-tuning AI.
        </p>
      </div>

      <div className="space-y-3">
        {reviews.map((item) => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-400">{item.topic}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                {item.status}
              </span>
            </div>
            <div className="text-xs text-slate-400 line-through">Draft AI: {item.original}</div>
            <div className="text-xs text-slate-200">Koreksi User: {item.correction}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
