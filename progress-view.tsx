"use client";

export default function ProgressView() {
  const progressList = [
    { topic: "Quantum Computing", level: "Beginner", score: 85 },
    { topic: "Recursion & Data Structure", level: "Intermediate", score: 92 },
    { topic: "Photosynthesis Mechanism", level: "Advanced", score: 78 },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h2 className="text-sm font-bold text-white mb-1">Learning Progress Tracker</h2>
        <p className="text-xs text-slate-400">
          Ringkasan topik yang telah kamu pelajari beserta estimasi tingkat pemahaman kognitif.
        </p>
      </div>

      <div className="grid gap-3">
        {progressList.map((item, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-white">{item.topic}</h3>
              <span className="text-[10px] text-slate-400">Level: {item.level}</span>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-indigo-400">{item.score}%</span>
              <span className="block text-[10px] text-slate-500">Mastery</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
