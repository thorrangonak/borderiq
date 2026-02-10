import { Globe } from "lucide-react";
import type { Metadata } from "next";
import { getRankings } from "@/lib/load-data";
import CountriesClient from "./CountriesClient";

export const metadata: Metadata = {
  title: "All 199 Countries - Passport Data & Visa Requirements",
  description: "Complete directory of 199 countries with passport rankings, mobility scores, visa-free access data, and detailed visa requirements.",
  alternates: { canonical: "https://borderiq.io/countries" },
  openGraph: {
    title: "All Countries - BorderIQ",
    description: "Complete directory of 199 countries with passport data and visa requirements.",
    url: "https://borderiq.io/countries",
  },
};

export default function CountriesPage() {
  const rankings = getRankings();

  // Sort alphabetically by country name
  const sorted = [...rankings].sort((a, b) =>
    a.country.localeCompare(b.country)
  );

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 gradient-radial-teal" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-8 sm:pb-12">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-teal-500/15">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
            </div>
            <span className="text-teal-400 font-medium tracking-wide uppercase text-xs sm:text-sm">
              Directory
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-white via-teal-200 to-teal-400 bg-clip-text text-transparent">
              All Countries
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-foreground-muted max-w-3xl leading-relaxed">
            Browse all {sorted.length} countries and territories. View passport
            mobility scores, rankings, and regional data at a glance.
          </p>
        </div>
      </section>

      {/* Countries Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <CountriesClient rankings={sorted} />
      </section>
    </div>
  );
}
