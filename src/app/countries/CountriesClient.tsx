"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import CountryFlag from "@/components/ui/CountryFlag";
import type { PassportRanking } from "@/lib/data";

interface CountriesClientProps {
  rankings: PassportRanking[];
}

function getMobilityColor(score: number): string {
  if (score >= 150) return "text-emerald-400";
  if (score >= 100) return "text-yellow-400";
  if (score >= 60) return "text-orange-400";
  return "text-red-400";
}

function getMobilityBg(score: number): string {
  if (score >= 150) return "bg-emerald-500";
  if (score >= 100) return "bg-yellow-500";
  if (score >= 60) return "bg-orange-500";
  return "bg-red-500";
}

export default function CountriesClient({ rankings }: CountriesClientProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
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

  // Group by first letter for quick scanning
  const letters = useMemo(() => {
    const letterSet = new Set(filtered.map((r) => r.country[0].toUpperCase()));
    return [...letterSet].sort();
  }, [filtered]);

  return (
    <div>
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground-subtle" />
          <input
            type="text"
            placeholder="Search by name, code, or region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-800 border border-border text-foreground placeholder:text-foreground-subtle text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/25 transition-colors"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-foreground-muted">
          Showing{" "}
          <span className="text-foreground font-medium">{filtered.length}</span>{" "}
          of{" "}
          <span className="text-foreground font-medium">{rankings.length}</span>{" "}
          countries
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
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-foreground-subtle mx-auto mb-4" />
          <p className="text-foreground-muted text-lg mb-2">
            No countries found
          </p>
          <p className="text-foreground-subtle text-sm">
            Try a different search term.
          </p>
        </div>
      )}

      {/* Countries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((r) => (
          <Link key={r.slug} href={`/country/${r.slug}`}>
            <div className="card-interactive p-4 relative overflow-hidden">
              {/* Top color bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-0.5 ${getMobilityBg(r.mobilityScore)}`}
              />

              <div className="flex items-center gap-3">
                <CountryFlag code={r.meta.code} size="md" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-foreground font-medium text-sm truncate">
                    {r.country}
                  </h3>
                  <p className="text-foreground-subtle text-xs">
                    {r.meta.region}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-foreground-subtle text-[10px] uppercase tracking-wider">
                      Rank
                    </p>
                    <p className="text-foreground font-bold text-sm">
                      #{r.rank}
                    </p>
                  </div>
                  <div className="w-px h-6 bg-border" />
                  <div>
                    <p className="text-foreground-subtle text-[10px] uppercase tracking-wider">
                      Score
                    </p>
                    <p
                      className={`font-bold text-sm ${getMobilityColor(r.mobilityScore)}`}
                    >
                      {r.mobilityScore}
                    </p>
                  </div>
                </div>
                <span className="text-foreground-subtle text-xs font-mono">
                  {r.meta.code}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
