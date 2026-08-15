"use client";

import { ActiveTab } from "@/types";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const tabs: { id: ActiveTab; label: string }[] = [
    { id: "learn", label: "Learn" },
    { id: "review", label: "Review & Feedback" },
    { id: "progress", label: "Progress" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="max-w-5xl mx-auto flex h-14 items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-7 w-7 rounded-lg bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center font-mono text-xs text-indigo-400 font-bold">
            ZL
          </div>
          <span className="font-bold text-white tracking-wider text-sm sm:text-base">
            ZEY LEARN AI
          </span>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors sm:px-3 sm:text-xs ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
