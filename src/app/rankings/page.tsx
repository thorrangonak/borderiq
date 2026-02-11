import { Trophy, Globe } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { getRankings } from "@/lib/load-data";
import { REGIONS, slugify } from "@/lib/countries";
import type { PassportRanking } from "@/lib/data";
import { getRankingsFAQs, getRegionStats } from "@/lib/seo-data";
import { getFAQSchema } from "@/lib/structured-data";
import RankingsTable from "./RankingsTable";

export const metadata: Metadata = {
  title: "Passport Rankings 2026 - World Passport Power Index | 199 Countries",
  description: "Complete passport power rankings for 2026. See which passport is #1, compare visa-free access, mobility scores, and travel freedom for all 199 passports. Updated with the latest visa policy data.",
  alternates: { canonical: "https://borderiq.io/rankings" },
  openGraph: {
    title: "Passport Rankings 2026 - World Passport Power Index",
    description: "Complete passport power rankings. Compare visa-free access and mobility scores for 199 passports.",
    url: "https://borderiq.io/rankings",
  },
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

  const topCountry = rankings[0]?.country ?? 'Unknown';
  const faqs = getRankingsFAQs(topCountry, highestScore, totalCountries);
  const regionStats = getRegionStats(rankings);

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Table',
            name: 'Passport Power Rankings 2026',
            description: 'Global passport power rankings based on visa-free mobility score for 199 countries.',
            about: {
              '@type': 'Thing',
              name: 'Passport Power Index',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://borderiq.io' },
              { '@type': 'ListItem', position: 2, name: 'Rankings', item: 'https://borderiq.io/rankings' },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getFAQSchema(faqs)) }}
      />
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

      {/* SEO Content Sections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        {/* Most Powerful Passport */}
        <div className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Most Powerful Passport in 2026
          </h2>
          <p className="text-gray-400 leading-relaxed">
            The most powerful passport in 2026 is <Link href={`/country/${rankings[0]?.slug}`} className="text-teal-400 hover:underline">{topCountry}</Link> with
            a mobility score of {highestScore}, granting its holders visa-free or easy access to {highestScore} destinations worldwide.
            {rankings[1] && <> The second strongest is <Link href={`/country/${rankings[1].slug}`} className="text-teal-400 hover:underline">{rankings[1].country}</Link> ({rankings[1].mobilityScore})</>}
            {rankings[2] && <>, followed by <Link href={`/country/${rankings[2].slug}`} className="text-teal-400 hover:underline">{rankings[2].country}</Link> ({rankings[2].mobilityScore})</>}.
            The global average mobility score is {avgMobility}, with scores ranging from {highestScore} to {lowestScore}.
          </p>
        </div>

        {/* How Rankings Are Calculated */}
        <div className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            How Are Passport Rankings Calculated?
          </h2>
          <p className="text-gray-400 leading-relaxed">
            BorderIQ passport rankings are based on the <strong className="text-white">mobility score</strong> — the total
            number of destinations a passport holder can access without obtaining a visa before departure.
            This includes three categories: <strong className="text-emerald-400">visa-free entry</strong> (no visa needed at all),{" "}
            <strong className="text-teal-400">visa on arrival (VOA)</strong> (visa issued at the border), and{" "}
            <strong className="text-blue-400">electronic travel authorization (ETA)</strong> (quick online approval).
            E-visas and traditional visas are not counted toward the mobility score as they require
            pre-departure application. Rankings are compiled from official government data and verified travel databases.
          </p>
        </div>

        {/* Strongest by Region */}
        <div className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Strongest Passports by Region
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionStats.map(({ region, topPassports, avgScore, count }) => (
              <div key={region} className="rounded-xl bg-white/5 border border-white/10 p-4">
                <h3 className="text-lg font-semibold text-white mb-1">{region}</h3>
                <p className="text-gray-500 text-xs mb-3">{count} countries &middot; Avg score: {avgScore}</p>
                <div className="space-y-1.5">
                  {topPassports.map((p, i) => (
                    <Link
                      key={p.country}
                      href={`/country/${p.slug}`}
                      className="flex items-center justify-between text-sm text-gray-300 hover:text-teal-400 transition-colors"
                    >
                      <span>{i + 1}. {p.country}</span>
                      <span className="text-gray-500 text-xs">#{p.rank} &middot; {p.mobilityScore}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="rounded-xl bg-white/5 border border-white/10 p-5">
            {faqs.map((faq, i) => (
              <details key={i} className="group mb-3 last:mb-0">
                <summary className="cursor-pointer text-gray-300 hover:text-white font-medium py-2 px-3 rounded-lg hover:bg-white/5 transition-colors list-none flex items-center justify-between">
                  {faq.question}
                  <span className="text-gray-500 group-open:rotate-90 transition-transform">&rsaquo;</span>
                </summary>
                <p className="text-gray-400 text-sm leading-relaxed px-3 pb-2 pt-1">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
