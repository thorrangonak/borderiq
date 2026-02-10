import { Compass } from "lucide-react";
import type { Metadata } from "next";
import { getRankings } from "@/lib/load-data";
import ExploreClient from "./ExploreClient";

export const metadata: Metadata = {
  title: "Explore World Passports by Region, Color & Score",
  description: "Browse passports by region, cover color, and mobility score. Discover travel freedom patterns across Africa, Americas, Asia, Europe, and Oceania.",
  alternates: { canonical: "https://borderiq.io/explore" },
  openGraph: {
    title: "Explore World Passports - BorderIQ",
    description: "Browse passports by region, cover color, and mobility score for 199 countries.",
    url: "https://borderiq.io/explore",
  },
};

export default function ExplorePage() {
  const rankings = getRankings();

  return (
    <div className="min-h-screen">
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

      {/* Explore Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ExploreClient rankings={rankings} />
      </section>
    </div>
  );
}
