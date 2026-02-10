"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/ui/SearchBar";

interface DestinationTabsProps {
  visaFree: { name: string; code: string; slug: string }[];
  visaOnArrival: { name: string; code: string; slug: string }[];
  eta: { name: string; code: string; slug: string }[];
  eVisa: { name: string; code: string; slug: string }[];
  visaRequired: { name: string; code: string; slug: string }[];
}

const TABS = [
  { key: "visaFree", label: "Visa Free", color: "emerald" },
  { key: "visaOnArrival", label: "Visa on Arrival", color: "teal" },
  { key: "eta", label: "ETA", color: "blue" },
  { key: "eVisa", label: "e-Visa", color: "yellow" },
  { key: "visaRequired", label: "Visa Required", color: "red" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const TAB_COLORS: Record<string, { active: string; inactive: string; badge: string }> = {
  emerald: {
    active: "border-emerald-400 text-emerald-400",
    inactive: "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600",
    badge: "bg-emerald-500/20 text-emerald-400",
  },
  teal: {
    active: "border-teal-400 text-teal-400",
    inactive: "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600",
    badge: "bg-teal-500/20 text-teal-400",
  },
  blue: {
    active: "border-blue-400 text-blue-400",
    inactive: "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600",
    badge: "bg-blue-500/20 text-blue-400",
  },
  yellow: {
    active: "border-yellow-400 text-yellow-400",
    inactive: "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600",
    badge: "bg-yellow-500/20 text-yellow-400",
  },
  red: {
    active: "border-red-400 text-red-400",
    inactive: "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600",
    badge: "bg-red-500/20 text-red-400",
  },
};

function CountryPill({ name, code, slug }: { name: string; code: string; slug: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/country/${slug}`}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all duration-200 group"
    >
      {!imgError ? (
        <Image
          src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
          alt={`${name} flag`}
          width={24}
          height={18}
          className="w-6 h-[18px] rounded shadow-sm object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="w-6 h-[18px] rounded bg-white/10 flex items-center justify-center text-[10px] text-gray-400 font-mono">
          {code}
        </span>
      )}
      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
        {name}
      </span>
    </Link>
  );
}

export default function DestinationTabs({
  visaFree,
  visaOnArrival,
  eta,
  eVisa,
  visaRequired,
}: DestinationTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("visaFree");
  const [search, setSearch] = useState("");

  const data: Record<TabKey, { name: string; code: string; slug: string }[]> = {
    visaFree,
    visaOnArrival,
    eta,
    eVisa,
    visaRequired,
  };

  const counts: Record<TabKey, number> = {
    visaFree: visaFree.length,
    visaOnArrival: visaOnArrival.length,
    eta: eta.length,
    eVisa: eVisa.length,
    visaRequired: visaRequired.length,
  };

  const filtered = useMemo(() => {
    const items = data[activeTab];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)
    );
  }, [activeTab, search, data]);

  return (
    <div>
      {/* Tab Headers */}
      <div className="flex overflow-x-auto scrollbar-hide gap-1 border-b border-white/10 mb-4 sm:mb-6 -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const colors = TAB_COLORS[tab.color];
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSearch("");
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap shrink-0 ${
                isActive ? colors.active : colors.inactive
              }`}
            >
              {tab.label}
              <span
                className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                  isActive ? colors.badge : "bg-white/5 text-gray-500"
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6 w-full sm:max-w-md">
        <SearchBar
          placeholder={`Search destinations...`}
          value={search}
          onChange={setSearch}
        />
      </div>

      {/* Country pills grid */}
      {filtered.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {filtered.map((dest) => (
            <CountryPill key={dest.slug} name={dest.name} code={dest.code} slug={dest.slug} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {search
              ? `No destinations matching "${search}"`
              : "No destinations in this category"}
          </p>
        </div>
      )}
    </div>
  );
}
