import type { Metadata } from "next";
import { COUNTRIES } from '@/lib/countries';
import CombineClient from './CombineClient';
import { getBreadcrumbSchema, getCompareToolSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Combine Passports - See Your Total Travel Power",
  description: "Hold multiple passports? Combine up to 4 passports to discover your true mobility score, global rank, and a full destination breakdown showing which passport gives the best access.",
  alternates: { canonical: "https://borderiq.io/combine" },
  openGraph: {
    title: "Combine Passports - BorderIQ",
    description: "Combine multiple passports and discover your combined travel power, global rank, and per-destination visa breakdown.",
    url: "https://borderiq.io/combine",
  },
};

export default function CombinePage() {
  const countries = Object.values(COUNTRIES).map(c => ({
    name: c.name,
    code: c.code,
  }));

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'BorderIQ Passport Combine Tool',
            url: 'https://borderiq.io/combine',
            applicationCategory: 'TravelApplication',
            operatingSystem: 'Web',
            description: 'Combine up to 4 passports to see your total travel power, global rank, and destination breakdown.',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBreadcrumbSchema([
            { name: 'Home', url: 'https://borderiq.io' },
            { name: 'Combine Passports', url: 'https://borderiq.io/combine' },
          ])),
        }}
      />

      {/* Hero header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-navy-800" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[450px] lg:w-[600px] h-[200px] sm:h-[300px] lg:h-[400px] bg-purple-500/8 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-20 pb-8 sm:pb-12 text-center">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              Combine Passports
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-foreground-muted max-w-2xl mx-auto">
            Hold multiple passports? Combine them to discover your true travel power and global rank.
          </p>
        </div>
      </section>

      {/* Combine tool */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <CombineClient countries={countries} />
      </section>
    </div>
  );
}
