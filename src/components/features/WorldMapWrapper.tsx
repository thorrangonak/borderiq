"use client";

import dynamic from "next/dynamic";

const WorldMap = dynamic(() => import("@/components/features/WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[2/1] bg-slate-900/50 rounded-2xl border border-white/10 flex items-center justify-center">
      <div className="text-gray-500 text-sm">Loading map...</div>
    </div>
  ),
});

export default function WorldMapWrapper() {
  return <WorldMap />;
}
