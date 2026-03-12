"use client";

import { useState } from "react";
import { ClipsFeed } from "./clips-feed";
import { ReplaysFeed } from "./replays-feed";

type Tab = "replays" | "live" | "clips";

const TABS: { id: Tab; label: string }[] = [
  { id: "replays", label: "Replays" },
  { id: "live", label: "Live" },
  { id: "clips", label: "Clips" },
];

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState<Tab>("replays");

  // Clips = fullscreen fixed, les autres tabs = layout normal
  if (activeTab === "clips") {
    return (
      <ClipsFeed
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    );
  }

  return (
    <div className="min-h-dvh pt-12">
      {/* Tabs */}
      <div className="flex items-center gap-6 px-5 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-base font-medium pb-1 transition-colors border-b-2 ${
              activeTab === tab.id
                ? "text-white border-white"
                : "text-white/40 border-transparent"
            }`}
            style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "replays" && <ReplaysFeed />}
      {activeTab === "live" && (
        <div className="flex flex-col items-center justify-center px-8 pt-24 text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-2">
            <span className="text-2xl">📡</span>
          </div>
          <h2 className="text-white font-semibold text-lg">Aucun live en cours</h2>
          <p className="text-white/40 text-sm leading-relaxed">
            Pas de diffusion en direct pour le moment.
            <br />
            Vous serez notifié dès qu'un live démarre !
          </p>
        </div>
      )}
    </div>
  );
}
