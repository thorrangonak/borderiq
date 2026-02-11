"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  X,
  ArrowRight,
  Users,
  Fingerprint,
  Globe,
  TrendingUp,
  Shield,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import CountryFlag from "@/components/ui/CountryFlag";
import CountrySelect from "@/components/ui/CountrySelect";
import type { PassportRanking } from "@/lib/data";

interface CompareClientProps {
  countries: Array<{ name: string; code: string }>;
}

interface DestinationEntry {
  destination: string;
  code: string;
  slug: string;
  bestStatus: string;
  bestPassport: string;
  perPassport: Record<string, string>;
}

interface CombinedStats {
  visaFree: number;
  voa: number;
  eta: number;
  eVisa: number;
  visaRequired: number;
  noAdmission: number;
}

interface ComparisonData {
  countries: string[];
  rankings: Record<string, PassportRanking>;
  combinedMobilityScore: number;
  combinedRank: number;
  combinedStats: CombinedStats;
  individualStats: Record<string, CombinedStats>;
  gainFromCombining: number;
  maxIndividualScore: number;
  destinationTable: DestinationEntry[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  "visa-free": { label: "Visa Free", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/25" },
  voa: { label: "VOA", color: "text-teal-400", bg: "bg-teal-500/15", border: "border-teal-500/25" },
  eta: { label: "ETA", color: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/25" },
  "e-visa": { label: "e-Visa", color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/25" },
  "visa-required": { label: "Visa Req.", color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/25" },
  "no-admission": { label: "No Entry", color: "text-gray-500", bg: "bg-gray-500/15", border: "border-gray-500/25" },
};

function StatusBadge({ status, small }: { status: string; small?: boolean }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["visa-required"];
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${config.bg} ${config.color} ${config.border} ${
        small ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      }`}
    >
      {config.label}
    </span>
  );
}

export default function CompareClient({ countries }: CompareClientProps) {
  const [selections, setSelections] = useState<string[]>(["", ""]);
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Destination table filters
  const [tableSearch, setTableSearch] = useState("");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [tableSort, setTableSort] = useState<"name" | "best">("best");
  const [tableSortDir, setTableSortDir] = useState<"asc" | "desc">("asc");
  const [showCount, setShowCount] = useState(50);

  const validSelections = selections.filter(Boolean);
  const canCompare = validSelections.length >= 2;
  const canAddMore = selections.length < 4;

  const fetchComparison = useCallback(async (selected: string[]) => {
    const valid = selected.filter(Boolean);
    if (valid.length < 2) { setData(null); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/compare?countries=${encodeURIComponent(valid.join(","))}`);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to fetch");
      }
      setData(await res.json());
      setShowCount(50);
      setTableSearch("");
      setTableFilter("all");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (validSelections.length >= 2) fetchComparison(selections);
    else setData(null);
  }, [selections, fetchComparison]);

  function updateSelection(index: number, value: string) {
    setSelections((prev) => { const next = [...prev]; next[index] = value; return next; });
  }
  function removeSelection(index: number) {
    if (selections.length <= 2) {
      setSelections((prev) => { const next = [...prev]; next[index] = ""; return next; });
    } else {
      setSelections((prev) => prev.filter((_, i) => i !== index));
    }
  }
  function addSlot() { if (selections.length < 4) setSelections((prev) => [...prev, ""]); }
  function getExcluded(i: number) { return selections.filter((s, idx) => idx !== i && s !== ""); }
  function getCode(name: string) { return countries.find((c) => c.name === name)?.code ?? ""; }

  // Filtered & sorted destination table
  const filteredDestinations = useMemo(() => {
    if (!data) return [];
    let list = data.destinationTable;

    if (tableSearch) {
      const q = tableSearch.toLowerCase();
      list = list.filter(
        (d) => d.destination.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)
      );
    }
    if (tableFilter !== "all") {
      list = list.filter((d) => d.bestStatus === tableFilter);
    }

    list = [...list].sort((a, b) => {
      if (tableSort === "name") {
        return tableSortDir === "asc"
          ? a.destination.localeCompare(b.destination)
          : b.destination.localeCompare(a.destination);
      }
      // Sort by best status priority
      const pa = Object.keys(STATUS_CONFIG).indexOf(a.bestStatus);
      const pb = Object.keys(STATUS_CONFIG).indexOf(b.bestStatus);
      return tableSortDir === "asc" ? pa - pb : pb - pa;
    });

    return list;
  }, [data, tableSearch, tableFilter, tableSort, tableSortDir]);

  const visibleDestinations = filteredDestinations.slice(0, showCount);

  return (
    <div>
      {/* Country selectors */}
      <div className="rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-teal-400 shrink-0" />
          Select Passports to Compare
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selections.map((value, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                  Passport {index + 1}
                </label>
                <CountrySelect
                  value={value}
                  onChange={(v) => updateSelection(index, v)}
                  countries={countries}
                  placeholder="Choose a country..."
                  exclude={getExcluded(index)}
                />
              </div>
              {(selections.length > 2 || value) && (
                <button
                  type="button"
                  onClick={() => removeSelection(index)}
                  className="mt-6 shrink-0 p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {canAddMore && (
          <button
            type="button"
            onClick={addSlot}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Passport
          </button>
        )}
        {!canCompare && validSelections.length > 0 && (
          <p className="mt-4 text-sm text-gray-500 flex items-center gap-2">
            <ArrowRight className="w-4 h-4" /> Select at least one more passport
          </p>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
            Comparing passports...
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 mb-8">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-6 sm:space-y-8">
          {/* === Passport Overview Cards === */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-400" />
              Individual Passport Power
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.countries.map((name) => {
                const ranking = data.rankings[name];
                if (!ranking) return null;
                const code = getCode(name);
                const iStats = data.individualStats[name];
                return (
                  <div key={name} className="rounded-xl bg-white/5 border border-white/10 p-4 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      ranking.mobilityScore >= 150 ? "bg-emerald-500" : ranking.mobilityScore >= 100 ? "bg-yellow-500" : "bg-red-500"
                    }`} />
                    <div className="flex items-center gap-3 mb-3 mt-1">
                      <CountryFlag code={code} size="md" />
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold truncate text-sm">{name}</h3>
                        <p className="text-gray-500 text-xs">Rank #{ranking.rank}</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">{ranking.mobilityScore}</div>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="bg-emerald-500/10 rounded-lg py-1">
                        <div className="text-emerald-400 text-xs font-bold">{iStats?.visaFree || 0}</div>
                        <div className="text-gray-500 text-[9px]">Free</div>
                      </div>
                      <div className="bg-teal-500/10 rounded-lg py-1">
                        <div className="text-teal-400 text-xs font-bold">{iStats?.voa || 0}</div>
                        <div className="text-gray-500 text-[9px]">VOA</div>
                      </div>
                      <div className="bg-blue-500/10 rounded-lg py-1">
                        <div className="text-blue-400 text-xs font-bold">{iStats?.eta || 0}</div>
                        <div className="text-gray-500 text-[9px]">ETA</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* === Combined Power Section === */}
          <div className="rounded-2xl bg-gradient-to-br from-teal-500/10 via-blue-500/10 to-purple-500/10 border border-teal-500/20 p-5 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-teal-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Combined Passport Power</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {/* Combined Score */}
              <div className="col-span-2 sm:col-span-1 bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <Globe className="w-6 h-6 text-teal-400 mx-auto mb-1" />
                <div className="text-3xl sm:text-4xl font-bold text-white">{data.combinedMobilityScore}</div>
                <div className="text-gray-400 text-xs mt-1">Combined Score</div>
              </div>
              {/* Combined Rank */}
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <Shield className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-white">#{data.combinedRank}</div>
                <div className="text-gray-400 text-xs mt-1">World Rank</div>
              </div>
              {/* Gain */}
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-emerald-400">+{data.gainFromCombining}</div>
                <div className="text-gray-400 text-xs mt-1">Extra Access</div>
              </div>
            </div>

            {/* Combined Stats Breakdown */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {([
                ["visaFree", "Visa Free", "text-emerald-400", "bg-emerald-500/10"],
                ["voa", "VOA", "text-teal-400", "bg-teal-500/10"],
                ["eta", "ETA", "text-blue-400", "bg-blue-500/10"],
                ["eVisa", "e-Visa", "text-yellow-400", "bg-yellow-500/10"],
                ["visaRequired", "Visa Req.", "text-red-400", "bg-red-500/10"],
                ["noAdmission", "No Entry", "text-gray-500", "bg-gray-500/10"],
              ] as const).map(([key, label, color, bg]) => (
                <div key={key} className={`${bg} rounded-lg p-2 text-center`}>
                  <div className={`text-lg font-bold ${color}`}>
                    {data.combinedStats[key as keyof CombinedStats]}
                  </div>
                  <div className="text-gray-500 text-[10px]">{label}</div>
                </div>
              ))}
            </div>

            {/* Gain Explanation */}
            {data.gainFromCombining > 0 && (
              <div className="mt-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
                <p className="text-sm text-gray-300">
                  <span className="text-emerald-400 font-semibold">+{data.gainFromCombining} extra destinations</span> by combining these passports.
                  Your strongest individual passport scores {data.maxIndividualScore}, but together they reach{" "}
                  <span className="text-white font-semibold">{data.combinedMobilityScore}</span>.
                </p>
              </div>
            )}
          </div>

          {/* === Full Destination Table === */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-400" />
                Destination Breakdown
                <span className="text-gray-500 text-sm font-normal">({filteredDestinations.length})</span>
              </h2>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Search country..."
                  className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 outline-none focus:border-teal-500/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500 shrink-0" />
                <select
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg text-sm text-white py-2.5 px-3 outline-none focus:border-teal-500/50"
                >
                  <option value="all">All Status</option>
                  <option value="visa-free">Visa Free</option>
                  <option value="voa">Visa on Arrival</option>
                  <option value="eta">ETA</option>
                  <option value="e-visa">e-Visa</option>
                  <option value="visa-required">Visa Required</option>
                  <option value="no-admission">No Admission</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setTableSort("best"); setTableSortDir(d => d === "asc" ? "desc" : "asc"); }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    tableSort === "best" ? "bg-teal-500/15 text-teal-400" : "text-gray-400 hover:bg-white/5"
                  }`}
                >
                  Best Status {tableSort === "best" && (tableSortDir === "asc" ? <ChevronUp className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />)}
                </button>
                <button
                  onClick={() => { setTableSort("name"); setTableSortDir(d => d === "asc" ? "desc" : "asc"); }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    tableSort === "name" ? "bg-teal-500/15 text-teal-400" : "text-gray-400 hover:bg-white/5"
                  }`}
                >
                  Name {tableSort === "name" && (tableSortDir === "asc" ? <ChevronUp className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />)}
                </button>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-xs">
                    <th className="text-left py-3 pl-3 font-medium">Destination</th>
                    <th className="text-center py-3 font-medium">Best Access</th>
                    <th className="text-center py-3 font-medium">Best Via</th>
                    {data.countries.map((name) => (
                      <th key={name} className="text-center py-3 font-medium">
                        <div className="flex items-center justify-center gap-1">
                          <Image
                            src={`https://flagcdn.com/w40/${getCode(name).toLowerCase()}.png`}
                            alt="" width={16} height={11} className="rounded-sm"
                          />
                          <span className="truncate max-w-[80px]">{name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleDestinations.map((d) => (
                    <tr key={d.code} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-2.5 pl-3">
                        <Link href={`/country/${d.slug}`} className="flex items-center gap-2 hover:text-teal-400 transition-colors">
                          <Image
                            src={`https://flagcdn.com/w40/${d.code.toLowerCase()}.png`}
                            alt="" width={20} height={14} className="rounded-sm shrink-0"
                          />
                          <span className="text-white text-sm">{d.destination}</span>
                        </Link>
                      </td>
                      <td className="py-2.5 text-center">
                        <StatusBadge status={d.bestStatus} />
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="text-gray-400 text-xs">
                          {d.bestPassport === data.countries[0] ? "" : ""}
                          <Image
                            src={`https://flagcdn.com/w40/${getCode(d.bestPassport).toLowerCase()}.png`}
                            alt="" width={14} height={10} className="rounded-sm inline mr-1"
                          />
                          {d.bestPassport.length > 15 ? getCode(d.bestPassport) : d.bestPassport}
                        </span>
                      </td>
                      {data.countries.map((name) => {
                        const status = d.perPassport[name] || "no-admission";
                        return (
                          <td key={name} className="py-2.5 text-center">
                            <StatusBadge status={status} small />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-2">
              {visibleDestinations.map((d) => (
                <div key={d.code} className="bg-white/5 border border-white/5 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Link href={`/country/${d.slug}`} className="flex items-center gap-2">
                      <Image
                        src={`https://flagcdn.com/w40/${d.code.toLowerCase()}.png`}
                        alt="" width={20} height={14} className="rounded-sm"
                      />
                      <span className="text-white text-sm font-medium">{d.destination}</span>
                    </Link>
                    <StatusBadge status={d.bestStatus} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.countries.map((name) => {
                      const status = d.perPassport[name] || "no-admission";
                      const code = getCode(name);
                      return (
                        <div key={name} className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
                          <Image
                            src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
                            alt="" width={14} height={10} className="rounded-sm"
                          />
                          <StatusBadge status={status} small />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {filteredDestinations.length > showCount && (
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => setShowCount((c) => c + 50)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  Show more
                </button>
                <button
                  onClick={() => setShowCount(filteredDestinations.length)}
                  className="px-5 py-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-colors text-sm font-medium"
                >
                  Show all ({filteredDestinations.length})
                </button>
              </div>
            )}

            {filteredDestinations.length === 0 && (
              <div className="text-center py-10 text-gray-500 text-sm">
                No destinations match your filters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
