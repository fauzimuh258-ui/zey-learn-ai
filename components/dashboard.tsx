"use client";

import { useState } from "react";
import Navbar from "./navbar";
import LearnView from "./learn-view";
import ReviewView from "./review-view";
import ProgressView from "./progress-view";
import SettingsView from "./settings-view";
import { ActiveTab } from "@/types";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("learn");

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="p-4 sm:p-6">
        {activeTab === "learn" && <LearnView />}
        {activeTab === "review" && <ReviewView />}
        {activeTab === "progress" && <ProgressView />}
        {activeTab === "settings" && <SettingsView />}
      </main>
    </div>
  );
}
