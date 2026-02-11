import { Compass } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { getRankings } from "@/lib/load-data";
import { slugify } from "@/lib/countries";
import { getExploreFAQs, getRegionStats, getColorStats } from "@/lib/seo-data";
import { getFAQSchema } from "@/lib/structured-data";
import ExploreClient from "./ExploreClient";

export const metadata: Metadata = {
  title: "Explore World Passports by Region & Color 2026 | Passport Colors Explained",
  description: "Browse passports by region, cover color, and mobility score. Discover why passports are red, blue, green, or black. See the strongest passports in Africa, Americas, Asia, Europe, and Oceania.",
  alternates: { canonical: "https://borderiq.io/explore" },
  keywords: [
    "passport colors meaning",
    "why are passports different colors",
    "strongest passport by region",
    "passport cover color",
    "world passports",
  ],
  openGraph: {
    title: "Explore World Passports by Region & Color 2026",
    description: "Browse passports by region, cover color, and mobility score for 199 countries.",
    url: "https://borderiq.io/explore",
  },
};

export default function ExplorePage() {
  const rankings = getRankings();
  const faqs = getExploreFAQs();
  const regionStats = getRegionStats(rankings);
  const colorStats = getColorStats(rankings);

  const colorDisplay: Record<string, { bg: string; text: string; border: string }> = {
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    green: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    black: { bg: 'bg-gray-500/10', text: 'text-gray-300', border: 'border-gray-500/20' },
  };

  return (
    <div className="min-h-screen">
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
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
            </div>
            <span className="text-teal-400 font-medium tracking-wide uppercase text-xs sm:text-sm">
              Discover
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-white via-teal-200 to-teal-400 bg-clip-text text-transparent">
              Explore Passports
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-foreground-muted max-w-3xl leading-relaxed">
            Browse passports by region, passport cover color, or mobility score
            range. Discover patterns in travel freedom across the globe.
          </p>
        </div>
      </section>

      {/* SEO Content - Above the interactive client */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        {/* Passports by Region */}
        <div className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Passports by Region
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionStats.map(({ region, topPassports, avgScore, count }) => (
              <div key={region} className="rounded-xl bg-white/5 border border-white/10 p-4">
                <h3 className="text-lg font-semibold text-white mb-1">{region}</h3>
                <p className="text-gray-500 text-xs mb-2">{count} countries &middot; Average score: {avgScore}</p>
                <p className="text-gray-400 text-sm mb-2">
                  Top passport: <Link href={`/country/${topPassports[0]?.slug}`} className="text-teal-400 hover:underline">{topPassports[0]?.country}</Link> (#{topPassports[0]?.rank}, score {topPassports[0]?.mobilityScore})
                </p>
                <div className="flex flex-wrap gap-1">
                  {topPassports.slice(1).map(p => (
                    <Link
                      key={p.country}
                      href={`/country/${p.slug}`}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {p.country} ({p.mobilityScore})
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Passport Colors */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Passport Colors and Their Meaning
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {colorStats.map(({ color, count, avgScore, description }) => {
              const style = colorDisplay[color] || colorDisplay.blue;
              return (
                <div key={color} className={`rounded-xl ${style.bg} border ${style.border} p-4`}>
                  <h3 className={`text-lg font-semibold ${style.text} mb-1 capitalize`}>
                    {color} Passports
                  </h3>
                  <p className="text-gray-500 text-xs mb-2">{count} countries &middot; Avg score: {avgScore}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Explore Interactive Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ExploreClient rankings={rankings} />
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
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
      </section>
    </div>
  );
}
