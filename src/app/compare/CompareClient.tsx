"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, ArrowRight, Users, Fingerprint, Globe } from "lucide-react";
import CountryFlag from "@/components/ui/CountryFlag";
import CountrySelect from "@/components/ui/CountrySelect";
import type { PassportRanking } from "@/lib/data";

interface CompareClientProps {
  countries: Array<{ name: string; code: string }>;
}

interface ComparisonData {
  countries: string[];
  rankings: Record<string, PassportRanking>;
  comparison: {
    common: { visaFree: string[]; visaOnArrival: string[]; eta: string[] };
    unique: Record<
      string,
      { visaFree: string[]; visaOnArrival: string[]; eta: string[] }
    >;
  };
  combinedMobilityScore: number;
}

function CountryPill({
  name,
  type,
}: {
  name: string;
  type: "visaFree" | "visaOnArrival" | "eta";
}) {
  const colorMap = {
    visaFree: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    visaOnArrival: "bg-teal-500/15 text-teal-400 border-teal-500/25",
    eta: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorMap[type]}`}
    >
      {name}
    </span>
  );
}

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
    if (valid.length < 2) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        countries: valid.join(","),
      });
      const res = await fetch(`/api/compare?${params}`);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to fetch comparison data");
      }
      const json: ComparisonData = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch when selections change
  useEffect(() => {
    const valid = selections.filter(Boolean);
    if (valid.length >= 2) {
      fetchComparison(selections);
    } else {
      setData(null);
    }
  }, [selections, fetchComparison]);

  function updateSelection(index: number, value: string) {
    setSelections((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function removeSelection(index: number) {
    if (selections.length <= 2) {
      // Can't go below 2 slots, just clear it
      setSelections((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
    } else {
      setSelections((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function addSlot() {
    if (selections.length < 4) {
      setSelections((prev) => [...prev, ""]);
    }
  }

  // Build exclude list: selected countries should not appear in other dropdowns
  function getExcluded(currentIndex: number): string[] {
    return selections.filter((s, i) => i !== currentIndex && s !== "");
  }

  // Get country code by name
  function getCode(name: string): string {
    return countries.find((c) => c.name === name)?.code ?? "";
  }

  return (
    <div>
      {/* Country selectors */}
      <div className="rounded-xl sm:rounded-2xl bg-card border border-border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-teal-400 shrink-0" />
          Select Passports to Compare
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selections.map((value, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <label className="block text-xs text-foreground-muted mb-1.5 font-medium">
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
              {/* Remove button */}
              {(selections.length > 2 || value) && (
                <button
                  type="button"
                  onClick={() => removeSelection(index)}
                  className="mt-6 flex-shrink-0 p-2 rounded-lg text-foreground-subtle hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  aria-label={`Remove passport ${index + 1}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add passport button */}
        {canAddMore && (
          <button
            type="button"
            onClick={addSlot}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 hover:border-teal-500/30 transition-colors text-sm font-medium cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Passport
          </button>
        )}

        {!canCompare && validSelections.length > 0 && (
          <p className="mt-4 text-sm text-foreground-subtle flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            Select at least one more passport to compare
          </p>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-foreground-muted">
            <div className="w-5 h-5 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
            <span>Comparing passports...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 mb-8">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="space-y-8 animate-fade-in">
          {/* Side-by-side passport cards */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-400" />
              Passport Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.countries.map((name) => {
                const ranking = data.rankings[name];
                if (!ranking) return null;
                const code = getCode(name);

                return (
                  <div
                    key={name}
                    className="rounded-xl bg-card border border-border p-5 relative overflow-hidden"
                  >
                    {/* Top accent bar */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 ${
                        ranking.mobilityScore >= 150
                          ? "bg-emerald-500"
                          : ranking.mobilityScore >= 100
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />

                    <div className="flex items-center gap-3 mb-4 mt-1">
                      <CountryFlag code={code} size="lg" />
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold truncate">
                          {name}
                        </h3>
                        <p className="text-foreground-subtle text-xs font-mono">
                          {code.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground-muted text-xs">
                          Rank
                        </span>
                        <span className="text-white font-bold">
                          #{ranking.rank}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground-muted text-xs">
                          Mobility
                        </span>
                        <span
                          className={`font-bold ${
                            ranking.mobilityScore >= 150
                              ? "text-emerald-400"
                              : ranking.mobilityScore >= 100
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {ranking.mobilityScore}
                        </span>
                      </div>
                      <div className="border-t border-border pt-2 mt-2 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-emerald-400">
                            Visa Free
                          </span>
                          <span className="text-xs text-white font-medium">
                            {ranking.visaFreeCount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-teal-400">VOA</span>
                          <span className="text-xs text-white font-medium">
                            {ranking.visaOnArrivalCount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-blue-400">ETA</span>
                          <span className="text-xs text-white font-medium">
                            {ranking.etaCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Combined Mobility Score */}
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-purple-500/10 border border-teal-500/20 p-4 sm:p-6 text-center">
            <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-teal-400 mx-auto mb-2 sm:mb-3" />
            <h3 className="text-foreground-muted text-xs sm:text-sm font-medium mb-1">
              Combined Mobility Score
            </h3>
            <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
              {data.combinedMobilityScore}
            </p>
            <p className="text-foreground-subtle text-xs sm:text-sm">
              Unique destinations accessible by holding all{" "}
              {data.countries.length} passports together
            </p>
          </div>

          {/* Common Access */}
          <div className="rounded-2xl bg-card border border-border p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Common Access
            </h2>
            <p className="text-sm text-foreground-muted mb-6">
              Destinations all selected passports can visit without a
              pre-arranged visa
            </p>

            {data.comparison.common.visaFree.length === 0 &&
            data.comparison.common.visaOnArrival.length === 0 &&
            data.comparison.common.eta.length === 0 ? (
              <p className="text-foreground-subtle text-sm py-4">
                No common visa-free, VOA, or ETA destinations found.
              </p>
            ) : (
              <div className="space-y-5">
                {/* Visa Free */}
                {data.comparison.common.visaFree.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="badge badge-visa-free">Visa Free</span>
                      <span className="text-foreground-subtle text-xs">
                        {data.comparison.common.visaFree.length} destinations
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {data.comparison.common.visaFree.sort().map((dest) => (
                        <CountryPill key={dest} name={dest} type="visaFree" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Visa on Arrival */}
                {data.comparison.common.visaOnArrival.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="badge badge-visa-on-arrival">
                        Visa on Arrival
                      </span>
                      <span className="text-foreground-subtle text-xs">
                        {data.comparison.common.visaOnArrival.length}{" "}
                        destinations
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {data.comparison.common.visaOnArrival
                        .sort()
                        .map((dest) => (
                          <CountryPill
                            key={dest}
                            name={dest}
                            type="visaOnArrival"
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* ETA */}
                {data.comparison.common.eta.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="badge badge-eta">ETA</span>
                      <span className="text-foreground-subtle text-xs">
                        {data.comparison.common.eta.length} destinations
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {data.comparison.common.eta.sort().map((dest) => (
                        <CountryPill key={dest} name={dest} type="eta" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Unique Access */}
          <div className="rounded-2xl bg-card border border-border p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Unique Access
            </h2>
            <p className="text-sm text-foreground-muted mb-6">
              Destinations only a specific passport can visit (that the others
              cannot)
            </p>

            <div className="space-y-6">
              {data.countries.map((name) => {
                const unique = data.comparison.unique[name];
                if (!unique) return null;

                const totalUnique =
                  unique.visaFree.length +
                  unique.visaOnArrival.length +
                  unique.eta.length;
                const code = getCode(name);

                return (
                  <div
                    key={name}
                    className="rounded-xl bg-navy-800/50 border border-border p-5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <CountryFlag code={code} size="sm" />
                      <h3 className="text-white font-semibold text-sm">
                        {name}
                      </h3>
                      <span className="text-foreground-subtle text-xs">
                        {totalUnique} unique destination
                        {totalUnique !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {totalUnique === 0 ? (
                      <p className="text-foreground-subtle text-xs">
                        No unique destinations for this passport in the current
                        comparison.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {unique.visaFree.length > 0 && (
                          <div>
                            <span className="text-emerald-400 text-xs font-medium mb-1.5 block">
                              Visa Free ({unique.visaFree.length})
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {unique.visaFree.sort().map((dest) => (
                                <CountryPill
                                  key={dest}
                                  name={dest}
                                  type="visaFree"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {unique.visaOnArrival.length > 0 && (
                          <div>
                            <span className="text-teal-400 text-xs font-medium mb-1.5 block">
                              Visa on Arrival ({unique.visaOnArrival.length})
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {unique.visaOnArrival.sort().map((dest) => (
                                <CountryPill
                                  key={dest}
                                  name={dest}
                                  type="visaOnArrival"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {unique.eta.length > 0 && (
                          <div>
                            <span className="text-blue-400 text-xs font-medium mb-1.5 block">
                              ETA ({unique.eta.length})
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {unique.eta.sort().map((dest) => (
                                <CountryPill
                                  key={dest}
                                  name={dest}
                                  type="eta"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
