"use client";

import { useState } from "react";

export default function SettingsView() {
  const [gatewayUrl, setGatewayUrl] = useState("https://zey-ai.vercel.app/api/chat");
  const [apiKey, setApiKey] = useState("vvbam988");
  const [searchUrl, setSearchUrl] = useState("https://zey-search.vercel.app");
  const [vaultUrl, setVaultUrl] = useState("https://zey-vault.vercel.app");

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
          System & API Configurations
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Gateway Zey AI URL</label>
            <input
              type="text"
              value={gatewayUrl}
              onChange={(e) => setGatewayUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Gateway API Key</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Zey Search API URL</label>
            <input
              type="text"
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Zey Vault Storage API</label>
            <input
              type="text"
              value={vaultUrl}
              onChange={(e) => setVaultUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
