import type { Metadata } from "next";
import { COUNTRIES } from '@/lib/countries';
import CombineClient from './CombineClient';
import { getBreadcrumbSchema } from "@/lib/structured-data";
import { getCombineFAQs } from "@/lib/seo-data";
import { getFAQSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Best Passport Combinations 2026 - Dual Citizenship Travel Power",
  description: "Discover the best passport combinations for maximum travel freedom. Combine up to 4 passports to see your true mobility score, global rank, and which destinations each passport unlocks. Dual citizenship travel power calculator.",
  alternates: { canonical: "https://borderiq.io/combine" },
  keywords: [
    "best passport combinations",
    "dual citizenship travel",
    "combine passports",
    "passport combination calculator",
    "dual passport travel power",
  ],
  openGraph: {
    title: "Best Passport Combinations 2026 - BorderIQ",
    description: "Combine multiple passports and discover your combined travel power, global rank, and per-destination visa breakdown.",
    url: "https://borderiq.io/combine",
  },
};

export default function CombinePage() {
  const countries = Object.values(COUNTRIES).map(c => ({
    name: c.name,
    code: c.code,
  }));

  const faqs = getCombineFAQs();

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getFAQSchema(faqs)) }}
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <CombineClient countries={countries} />
      </section>

      {/* SEO Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Best Passport Combinations in 2026
          </h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            The most powerful passport combinations pair passports from different regions to maximize
            global coverage. A strong European passport (providing EU/Schengen access) combined with
            a top Asian passport (like Singapore or Japan) often creates near-universal visa-free travel.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Use the tool above to test any combination of up to 4 passports. The combined score shows
            your total easy-access destinations, while the gain metric reveals how many extra countries
            you unlock beyond your strongest single passport.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            How Combining Passports Works
          </h2>
          <p className="text-gray-400 leading-relaxed">
            When you hold dual or multiple citizenship, you can present whichever passport grants the best
            entry conditions at each border. BorderIQ calculates your combined mobility score by taking
            the best visa status across all your passports for every destination. This means your combined
            score is always equal to or higher than your strongest single passport&apos;s score.
          </p>
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
