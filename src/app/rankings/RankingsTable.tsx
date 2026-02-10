"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronDown, ChevronUp, Filter, ArrowUpDown } from "lucide-react";
import CountryFlag from "@/components/ui/CountryFlag";
import type { PassportRanking } from "@/lib/data";

type SortField = "rank" | "visaFreeCount" | "mobilityScore";
type SortDir = "asc" | "desc";

interface RankingsTableProps {
  rankings: PassportRanking[];
  regions: string[];
}

const PAGE_SIZE = 25;

function getMobilityColor(score: number): string {
  if (score >= 150) return "text-emerald-400";
  if (score >= 100) return "text-yellow-400";
  if (score >= 60) return "text-orange-400";
  return "text-red-400";
}

function getMobilityBg(score: number): string {
  if (score >= 150) return "bg-emerald-500/15 border-emerald-500/25";
  if (score >= 100) return "bg-yellow-500/15 border-yellow-500/25";
  if (score >= 60) return "bg-orange-500/15 border-orange-500/25";
  return "bg-red-500/15 border-red-500/25";
}

function getRankBadge(rank: number): string {
  if (rank <= 3) return "bg-amber-500/15 text-amber-400 border border-amber-500/25";
  if (rank <= 10) return "bg-teal-500/15 text-teal-400 border border-teal-500/25";
  if (rank <= 30) return "bg-blue-500/15 text-blue-400 border border-blue-500/25";
  return "bg-navy-600 text-foreground-muted border border-border";
}

export default function RankingsTable({ rankings, regions }: RankingsTableProps) {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Filter and sort
  const filtered = useMemo(() => {
    let data = [...rankings];

    // Text search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(
        (r) =>
          r.country.toLowerCase().includes(q) ||
          r.meta.code.toLowerCase().includes(q) ||
          r.meta.code3.toLowerCase().includes(q) ||
          r.meta.region.toLowerCase().includes(q) ||
          r.meta.subregion.toLowerCase().includes(q)
      );
    }

    // Region filter
    if (regionFilter !== "all") {
      data = data.filter((r) => r.meta.region === regionFilter);
    }

    // Sort
    data.sort((a, b) => {
      let cmp = 0;
      if (sortField === "rank") {
        cmp = a.rank - b.rank;
      } else if (sortField === "visaFreeCount") {
        cmp = b.visaFreeCount - a.visaFreeCount;
      } else if (sortField === "mobilityScore") {
        cmp = b.mobilityScore - a.mobilityScore;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return data;
  }, [rankings, search, regionFilter, sortField, sortDir]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "rank" ? "asc" : "desc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-foreground-subtle" />;
    }
    return sortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-teal-400" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-teal-400" />
    );
  }

  return (
    <div>
      {/* ===== Search & Filter Bar ===== */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground-subtle" />
          <input
            type="text"
            placeholder="Search country, code, or region..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-800 border border-border text-foreground placeholder:text-foreground-subtle text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/25 transition-colors"
          />
        </div>

        {/* Region filter */}
        <div className="relative w-full sm:w-auto">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle pointer-events-none" />
          <select
            value={regionFilter}
            onChange={(e) => {
              setRegionFilter(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="appearance-none w-full sm:w-auto pl-9 pr-10 py-2.5 rounded-xl bg-navy-800 border border-border text-foreground text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/25 transition-colors cursor-pointer"
          >
            <option value="all">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle pointer-events-none" />
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-foreground-muted">
          Showing{" "}
          <span className="text-foreground font-medium">
            {Math.min(visibleCount, filtered.length)}
          </span>{" "}
          of{" "}
          <span className="text-foreground font-medium">{filtered.length}</span>{" "}
          countries
        </p>
        {(search || regionFilter !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setRegionFilter("all");
              setVisibleCount(PAGE_SIZE);
            }}
            className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ===== Desktop Table ===== */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy-800/80 border-b border-border">
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => toggleSort("rank")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted hover:text-foreground transition-colors"
                >
                  Rank
                  <SortIcon field="rank" />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Country
                </span>
              </th>
              <th className="text-center py-3 px-3">
                <button
                  onClick={() => toggleSort("visaFreeCount")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted hover:text-foreground transition-colors"
                >
                  Visa Free
                  <SortIcon field="visaFreeCount" />
                </button>
              </th>
              <th className="text-center py-3 px-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  VOA
                </span>
              </th>
              <th className="text-center py-3 px-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  ETA
                </span>
              </th>
              <th className="text-center py-3 px-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  e-Visa
                </span>
              </th>
              <th className="text-center py-3 px-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Visa Req.
                </span>
              </th>
              <th className="text-center py-3 px-4">
                <button
                  onClick={() => toggleSort("mobilityScore")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted hover:text-foreground transition-colors"
                >
                  Mobility
                  <SortIcon field="mobilityScore" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((r) => (
              <tr key={r.slug} className="table-row-hover group">
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold ${getRankBadge(r.rank)}`}
                  >
                    {r.rank}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link
                    href={`/country/${r.slug}`}
                    className="inline-flex items-center gap-3 group/link"
                  >
                    <CountryFlag code={r.meta.code} size="sm" />
                    <div className="min-w-0">
                      <span className="text-foreground font-medium group-hover/link:text-teal-400 transition-colors">
                        {r.country}
                      </span>
                      <span className="ml-2 text-foreground-subtle text-xs font-mono">
                        {r.meta.code}
                      </span>
                    </div>
                  </Link>
                </td>
                <td className="text-center py-3 px-3">
                  <span className="text-emerald-400 font-semibold">
                    {r.visaFreeCount}
                  </span>
                </td>
                <td className="text-center py-3 px-3 text-foreground-muted">
                  {r.visaOnArrivalCount}
                </td>
                <td className="text-center py-3 px-3 text-foreground-muted">
                  {r.etaCount}
                </td>
                <td className="text-center py-3 px-3 text-foreground-muted">
                  {r.eVisaCount}
                </td>
                <td className="text-center py-3 px-3 text-foreground-muted">
                  {r.visaRequiredCount}
                </td>
                <td className="text-center py-3 px-4">
                  <span
                    className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-0.5 rounded-md text-sm font-bold border ${getMobilityBg(r.mobilityScore)} ${getMobilityColor(r.mobilityScore)}`}
                  >
                    {r.mobilityScore}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Mobile Card View ===== */}
      <div className="md:hidden space-y-3">
        {visible.map((r) => (
          <Link
            key={r.slug}
            href={`/country/${r.slug}`}
            className="block card-interactive p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold ${getRankBadge(r.rank)}`}
                >
                  {r.rank}
                </span>
                <CountryFlag code={r.meta.code} size="sm" />
                <div>
                  <p className="text-foreground font-medium">{r.country}</p>
                  <p className="text-foreground-subtle text-xs">
                    {r.meta.region}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-lg text-sm font-bold border ${getMobilityBg(r.mobilityScore)} ${getMobilityColor(r.mobilityScore)}`}
              >
                {r.mobilityScore}
              </span>
            </div>

            {/* Stat bar */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-xs text-foreground-subtle">Visa Free</p>
                <p className="text-sm font-semibold text-emerald-400">
                  {r.visaFreeCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground-subtle">VOA</p>
                <p className="text-sm font-semibold text-foreground-muted">
                  {r.visaOnArrivalCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground-subtle">ETA</p>
                <p className="text-sm font-semibold text-foreground-muted">
                  {r.etaCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground-subtle">Visa Req.</p>
                <p className="text-sm font-semibold text-foreground-muted">
                  {r.visaRequiredCount}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ===== Empty State ===== */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-foreground-subtle mx-auto mb-4" />
          <p className="text-foreground-muted text-lg mb-2">
            No countries found
          </p>
          <p className="text-foreground-subtle text-sm">
            Try a different search term or clear your filters.
          </p>
        </div>
      )}

      {/* ===== Load More ===== */}
      {hasMore && (
        <div className="text-center mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="hidden sm:block flex-1 h-px bg-border" />
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-navy-700 border border-border text-foreground text-sm font-medium hover:bg-navy-600 hover:border-border-light transition-colors"
          >
            Show more
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => setVisibleCount(filtered.length)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-navy-700/50 border border-border text-foreground-muted text-sm font-medium hover:bg-navy-600 hover:text-foreground transition-colors"
          >
            Show all ({filtered.length})
          </button>
          <div className="hidden sm:block flex-1 h-px bg-border" />
        </div>
      )}
    </div>
  );
}
