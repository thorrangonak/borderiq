import { Trophy, Globe } from "lucide-react";
import { getRankings } from "@/lib/load-data";
import { REGIONS } from "@/lib/countries";
import type { PassportRanking } from "@/lib/data";
import RankingsTable from "./RankingsTable";

export const metadata = {
  title: "Passport Power Rankings 2026 - BorderIQ",
  description:
    "Complete passport power rankings for 2026. Compare visa-free access, mobility scores, and travel freedom for all 199 passports worldwide.",
};

export default function RankingsPage() {
  const rankings = getRankings();

  // Compute summary stats
  const totalCountries = rankings.length;
  const avgMobility = Math.round(
    rankings.reduce((sum, r) => sum + r.mobilityScore, 0) / totalCountries
  );
  const highestScore = rankings[0]?.mobilityScore ?? 0;
  const lowestScore = rankings[rankings.length - 1]?.mobilityScore ?? 0;

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 gradient-radial-teal" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-8 sm:pb-12">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-teal-500/15">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
            </div>
            <span className="text-teal-400 font-medium tracking-wide uppercase text-xs sm:text-sm">
              Passport Index
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-white via-teal-200 to-teal-400 bg-clip-text text-transparent">
              Passport Power Rankings
            </span>{" "}
            <span className="text-teal-400">2026</span>
          </h1>

          <p className="text-sm sm:text-lg text-foreground-muted max-w-3xl leading-relaxed mb-6 sm:mb-8">
            Rankings based on the total number of destinations a passport holder
            can access without a pre-departure visa &mdash; including visa-free
            entry, visa on arrival, and electronic travel authorization (ETA).
            Higher mobility scores indicate greater travel freedom.
          </p>

          {/* Summary stat pills */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-navy-700/60 border border-border px-3 sm:px-4 py-1.5 sm:py-2">
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-400" />
              <span className="text-xs sm:text-sm text-foreground-muted">
                <span className="text-foreground font-semibold">{totalCountries}</span> countries
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-navy-700/60 border border-border px-3 sm:px-4 py-1.5 sm:py-2">
              <span className="text-xs sm:text-sm text-foreground-muted">
                Avg:{" "}
                <span className="text-foreground font-semibold">{avgMobility}</span>
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-navy-700/60 border border-border px-3 sm:px-4 py-1.5 sm:py-2">
              <span className="text-xs sm:text-sm text-foreground-muted">
                Range:{" "}
                <span className="text-emerald-400 font-semibold">{highestScore}</span>
                {" "}&ndash;{" "}
                <span className="text-red-400 font-semibold">{lowestScore}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Rankings Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <RankingsTable rankings={rankings} regions={REGIONS} />
      </section>
    </div>
  );
}
