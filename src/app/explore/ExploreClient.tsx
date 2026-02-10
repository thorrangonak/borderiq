"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Globe,
  Palette,
  BarChart3,
  ChevronDown,
  ChevronRight,
  MapPin,
} from "lucide-react";
import CountryFlag from "@/components/ui/CountryFlag";
import { COUNTRIES, REGIONS } from "@/lib/countries";
import type { PassportRanking } from "@/lib/data";

type ViewMode = "region" | "color" | "score";

interface ExploreClientProps {
  rankings: PassportRanking[];
}

const PASSPORT_COLOR_MAP: Record<string, { label: string; bg: string; border: string; text: string; dot: string }> = {
  red: {
    label: "Red",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    text: "text-red-400",
    dot: "bg-red-500",
  },
  blue: {
    label: "Blue",
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
    text: "text-blue-400",
    dot: "bg-blue-500",
  },
  green: {
    label: "Green",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    text: "text-emerald-400",
    dot: "bg-emerald-500",
  },
  black: {
    label: "Black",
    bg: "bg-gray-500/10",
    border: "border-gray-500/25",
    text: "text-gray-400",
    dot: "bg-gray-500",
  },
};

const SCORE_RANGES = [
  { label: "High (150+)", min: 150, max: Infinity, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25" },
  { label: "Medium (100-149)", min: 100, max: 149, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/25" },
  { label: "Low (60-99)", min: 60, max: 99, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/25" },
  { label: "Very Low (<60)", min: 0, max: 59, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/25" },
];

const REGION_ICONS: Record<string, string> = {
  Africa: "#F59E0B",
  Americas: "#3B82F6",
  Asia: "#EF4444",
  Europe: "#8B5CF6",
  Oceania: "#10B981",
};

function getMobilityColor(score: number): string {
  if (score >= 150) return "text-emerald-400";
  if (score >= 100) return "text-yellow-400";
  if (score >= 60) return "text-orange-400";
  return "text-red-400";
}

function CountryCard({ ranking }: { ranking: PassportRanking }) {
  return (
    <Link href={`/country/${ranking.slug}`}>
      <div className="card-interactive p-4 flex items-center gap-3">
        <CountryFlag code={ranking.meta.code} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-foreground font-medium text-sm truncate">
            {ranking.country}
          </p>
          <p className="text-foreground-subtle text-xs">{ranking.meta.region}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-foreground-subtle text-xs">#{ranking.rank}</p>
          <p className={`font-bold text-sm ${getMobilityColor(ranking.mobilityScore)}`}>
            {ranking.mobilityScore}
          </p>
        </div>
      </div>
    </Link>
  );
}

function CollapsibleSection({
  title,
  count,
  children,
  defaultOpen = false,
  accentColor,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accentColor?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-navy-700/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {accentColor && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
          )}
          <h3 className="text-foreground font-semibold text-base">{title}</h3>
          <span className="text-foreground-subtle text-sm">
            ({count} {count === 1 ? "country" : "countries"})
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-foreground-muted" />
        ) : (
          <ChevronRight className="w-5 h-5 text-foreground-muted" />
        )}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 border-t border-border pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExploreClient({ rankings }: ExploreClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("region");
  const [search, setSearch] = useState("");

  const filteredRankings = useMemo(() => {
    if (!search.trim()) return rankings;
    const q = search.trim().toLowerCase();
    return rankings.filter(
      (r) =>
        r.country.toLowerCase().includes(q) ||
        r.meta.code.toLowerCase().includes(q) ||
        r.meta.code3.toLowerCase().includes(q) ||
        r.meta.region.toLowerCase().includes(q) ||
        r.meta.subregion.toLowerCase().includes(q)
    );
  }, [rankings, search]);

  // Group by region
  const byRegion = useMemo(() => {
    const groups: Record<string, PassportRanking[]> = {};
    for (const region of REGIONS) {
      groups[region] = [];
    }
    for (const r of filteredRankings) {
      const region = r.meta.region;
      if (groups[region]) {
        groups[region].push(r);
      }
    }
    return groups;
  }, [filteredRankings]);

  // Group by passport color
  const byColor = useMemo(() => {
    const groups: Record<string, PassportRanking[]> = {
      red: [],
      blue: [],
      green: [],
      black: [],
    };
    for (const r of filteredRankings) {
      const color = r.meta.passportColor;
      if (groups[color]) {
        groups[color].push(r);
      }
    }
    return groups;
  }, [filteredRankings]);

  // Group by score range
  const byScore = useMemo(() => {
    return SCORE_RANGES.map((range) => ({
      ...range,
      countries: filteredRankings.filter(
        (r) => r.mobilityScore >= range.min && r.mobilityScore <= range.max
      ),
    }));
  }, [filteredRankings]);

  const viewTabs: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: "region", label: "By Region", icon: <Globe className="w-4 h-4" /> },
    { key: "color", label: "By Color", icon: <Palette className="w-4 h-4" /> },
    { key: "score", label: "By Score Range", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div>
      {/* View Toggle + Search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* View toggle */}
        <div className="flex rounded-xl bg-navy-800 border border-border p-1 gap-1 w-full sm:w-auto">
          {viewTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                viewMode === tab.key
                  ? "bg-teal-500/15 text-teal-400 border border-teal-500/25"
                  : "text-foreground-muted hover:text-foreground hover:bg-navy-700/50 border border-transparent"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground-subtle" />
          <input
            type="text"
            placeholder="Search countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-800 border border-border text-foreground placeholder:text-foreground-subtle text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/25 transition-colors"
          />
        </div>
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-foreground-muted">
          <span className="text-foreground font-medium">{filteredRankings.length}</span>{" "}
          countries found
        </p>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Empty state */}
      {filteredRankings.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-foreground-subtle mx-auto mb-4" />
          <p className="text-foreground-muted text-lg mb-2">No countries found</p>
          <p className="text-foreground-subtle text-sm">
            Try a different search term.
          </p>
        </div>
      )}

      {/* Region View */}
      {viewMode === "region" && filteredRankings.length > 0 && (
        <div className="space-y-4">
          {REGIONS.map((region) => {
            const countries = byRegion[region];
            if (!countries || countries.length === 0) return null;
            return (
              <CollapsibleSection
                key={region}
                title={region}
                count={countries.length}
                defaultOpen={REGIONS.indexOf(region) === 0}
                accentColor={REGION_ICONS[region]}
              >
                {countries.map((r) => (
                  <CountryCard key={r.slug} ranking={r} />
                ))}
              </CollapsibleSection>
            );
          })}
        </div>
      )}

      {/* Color View */}
      {viewMode === "color" && filteredRankings.length > 0 && (
        <div className="space-y-4">
          {Object.entries(PASSPORT_COLOR_MAP).map(([color, style]) => {
            const countries = byColor[color];
            if (!countries || countries.length === 0) return null;
            return (
              <CollapsibleSection
                key={color}
                title={`${style.label} Passports`}
                count={countries.length}
                defaultOpen={color === "red"}
                accentColor={
                  color === "red"
                    ? "#EF4444"
                    : color === "blue"
                    ? "#3B82F6"
                    : color === "green"
                    ? "#10B981"
                    : "#6B7280"
                }
              >
                {countries.map((r) => (
                  <CountryCard key={r.slug} ranking={r} />
                ))}
              </CollapsibleSection>
            );
          })}
        </div>
      )}

      {/* Score Range View */}
      {viewMode === "score" && filteredRankings.length > 0 && (
        <div className="space-y-4">
          {byScore.map((group) => {
            if (group.countries.length === 0) return null;
            return (
              <CollapsibleSection
                key={group.label}
                title={group.label}
                count={group.countries.length}
                defaultOpen={group.label.startsWith("High")}
                accentColor={
                  group.min >= 150
                    ? "#10B981"
                    : group.min >= 100
                    ? "#EAB308"
                    : group.min >= 60
                    ? "#F97316"
                    : "#EF4444"
                }
              >
                {group.countries.map((r) => (
                  <CountryCard key={r.slug} ranking={r} />
                ))}
              </CollapsibleSection>
            );
          })}
        </div>
      )}
    </div>
  );
}
