"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  X,
  ArrowRight,
  Users,
  Fingerprint,
  GitCompare,
  Globe,
  Zap,
} from "lucide-react";
import CountryFlag from "@/components/ui/CountryFlag";
import CountrySelect from "@/components/ui/CountrySelect";
import type { PassportRanking } from "@/lib/data";

interface CompareClientProps {
  countries: Array<{ name: string; code: string }>;
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
}

const STAT_LABELS: { key: keyof CombinedStats; label: string; color: string; bg: string }[] = [
  { key: "visaFree", label: "Visa Free", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "voa", label: "VOA", color: "text-teal-400", bg: "bg-teal-500/10" },
  { key: "eta", label: "ETA", color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "eVisa", label: "e-Visa", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { key: "visaRequired", label: "Visa Req.", color: "text-red-400", bg: "bg-red-500/10" },
  { key: "noAdmission", label: "No Entry", color: "text-gray-500", bg: "bg-gray-500/10" },
];

export default function CompareClient({ countries }: CompareClientProps) {
  const [selections, setSelections] = useState<string[]>(["", ""]);
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Find the best passport in the comparison
  const bestPassport = data
    ? data.countries.reduce((best, name) => {
        const score = data.rankings[name]?.mobilityScore ?? 0;
        const bestScore = data.rankings[best]?.mobilityScore ?? 0;
        return score > bestScore ? name : best;
      }, data.countries[0])
    : null;

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
          {/* === Side-by-Side Passport Cards === */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-400" />
              Side-by-Side Comparison
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.countries.map((name) => {
                const ranking = data.rankings[name];
                if (!ranking) return null;
                const code = getCode(name);
                const iStats = data.individualStats[name];
                const isBest = name === bestPassport;
                return (
                  <div key={name} className={`rounded-xl border p-4 relative overflow-hidden ${
                    isBest ? "bg-teal-500/5 border-teal-500/30" : "bg-white/5 border-white/10"
                  }`}>
                    {isBest && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 text-[10px] font-bold border border-teal-500/25">
                        STRONGEST
                      </div>
                    )}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      ranking.mobilityScore >= 150 ? "bg-emerald-500" : ranking.mobilityScore >= 100 ? "bg-yellow-500" : "bg-red-500"
                    }`} />
                    <div className="flex items-center gap-3 mb-3 mt-1">
                      <CountryFlag code={code} size="md" />
                      <div className="min-w-0">
                        <Link href={`/country/${ranking.slug}`} className="text-white font-semibold truncate text-sm hover:text-teal-400 transition-colors block">
                          {name}
                        </Link>
                        <p className="text-gray-500 text-xs">Rank #{ranking.rank}</p>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-3">{ranking.mobilityScore}</div>
                    <div className="space-y-1.5">
                      {STAT_LABELS.map(({ key, label, color, bg }) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs">{label}</span>
                          <span className={`text-xs font-bold ${color} ${bg} px-2 py-0.5 rounded-md`}>
                            {iStats?.[key] || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* === Visual Bar Comparison === */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-teal-400" />
              Mobility Score Comparison
            </h2>
            <div className="space-y-4">
              {data.countries.map((name) => {
                const ranking = data.rankings[name];
                if (!ranking) return null;
                const code = getCode(name);
                const maxScore = 198;
                const pct = Math.round((ranking.mobilityScore / maxScore) * 100);
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Image
                          src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
                          alt="" width={20} height={14} className="rounded-sm"
                        />
                        <span className="text-white text-sm font-medium">{name}</span>
                      </div>
                      <span className="text-white font-bold text-sm">{ranking.mobilityScore}</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          name === bestPassport
                            ? "bg-gradient-to-r from-teal-500 to-emerald-400"
                            : "bg-gradient-to-r from-blue-500 to-blue-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* === Category Comparison Table === */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <Globe className="w-5 h-5 text-teal-400" />
              Category Breakdown
            </h2>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-xs">
                    <th className="text-left py-3 pl-3 font-medium">Category</th>
                    {data.countries.map((name) => (
                      <th key={name} className="text-center py-3 font-medium">
                        <div className="flex items-center justify-center gap-1">
                          <Image
                            src={`https://flagcdn.com/w40/${getCode(name).toLowerCase()}.png`}
                            alt="" width={16} height={11} className="rounded-sm"
                          />
                          <span className="truncate max-w-[100px]">{name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {STAT_LABELS.map(({ key, label, color, bg }) => (
                    <tr key={key} className="border-b border-white/5">
                      <td className={`py-3 pl-3 text-sm font-medium ${color}`}>{label}</td>
                      {data.countries.map((name) => {
                        const iStats = data.individualStats[name];
                        const val = iStats?.[key] || 0;
                        const allVals = data.countries.map(n => data.individualStats[n]?.[key] || 0);
                        const isBestInCat = val === Math.max(...allVals) && val > 0;
                        return (
                          <td key={name} className="py-3 text-center">
                            <span className={`inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-lg text-sm font-bold ${
                              isBestInCat ? `${bg} ${color}` : "text-gray-300"
                            }`}>
                              {val}
                              {isBestInCat && <span className="ml-1 text-[10px]">&#9650;</span>}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Total mobility row */}
                  <tr className="border-t border-white/10">
                    <td className="py-3 pl-3 text-sm font-bold text-white">Mobility Score</td>
                    {data.countries.map((name) => {
                      const score = data.rankings[name]?.mobilityScore ?? 0;
                      return (
                        <td key={name} className="py-3 text-center">
                          <span className={`inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-lg text-sm font-bold ${
                            name === bestPassport ? "bg-teal-500/15 text-teal-400" : "text-white"
                          }`}>
                            {score}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Mobile: stacked cards */}
            <div className="sm:hidden space-y-3">
              {STAT_LABELS.map(({ key, label, color, bg }) => (
                <div key={key} className="bg-white/5 rounded-xl p-3">
                  <p className={`text-xs font-semibold ${color} mb-2`}>{label}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {data.countries.map((name) => {
                      const iStats = data.individualStats[name];
                      const val = iStats?.[key] || 0;
                      const code = getCode(name);
                      return (
                        <div key={name} className="flex items-center gap-2">
                          <Image
                            src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
                            alt="" width={16} height={11} className="rounded-sm shrink-0"
                          />
                          <span className="text-white text-sm font-bold">{val}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA to Combine */}
          <div className="rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-5 sm:p-8 text-center">
            <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Want to see your combined travel power?</h3>
            <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto">
              Use the Combine tool to merge these passports and discover your total mobility score, global rank, and full destination breakdown.
            </p>
            <Link
              href={`/combine${validSelections.length >= 2 ? "" : ""}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-400 hover:to-blue-400 transition-all duration-200"
            >
              <Zap className="w-4 h-4" />
              Combine These Passports
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
