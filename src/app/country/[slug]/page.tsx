import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Globe, GitCompare, Shield, Users, ArrowRight } from "lucide-react";
import { getRankings, getVisaData } from "@/lib/load-data";
import { getCountryBySlug, COUNTRIES, slugify, getCountryByName } from "@/lib/countries";
import { getCountryDetail } from "@/lib/data";
import { getCountryFAQs, getSameRegionCountries, getSimilarRankCountries, getRelatedComparePagesForCountry } from "@/lib/seo-data";
import { getFAQSchema } from "@/lib/structured-data";
import DestinationTabs from "./DestinationTabs";

export function generateStaticParams() {
  return Object.values(COUNTRIES).map((c) => ({ slug: slugify(c.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) return { title: "Country Not Found" };

  const rankings = getRankings();
  const ranking = rankings.find(r => r.country === country.name);

  return {
    title: `${country.name} Passport Ranking 2026 - #${ranking?.rank || 'N/A'} | ${ranking?.mobilityScore || 0} Visa-Free Destinations`,
    description: `${country.name} passport is ranked #${ranking?.rank || 'N/A'} in 2026 with ${ranking?.mobilityScore || 0} visa-free destinations. ${ranking?.visaFreeCount || 0} visa-free, ${ranking?.visaOnArrivalCount || 0} VOA, ${ranking?.etaCount || 0} ETA. Full visa requirements and travel data for ${country.name} passport holders.`,
    alternates: { canonical: `https://borderiq.io/country/${slug}` },
    keywords: [
      `${country.name} passport`,
      `${country.name} visa-free`,
      `${country.name} passport ranking`,
      `${country.name} visa requirements`,
      `${country.name} travel`,
    ],
    openGraph: {
      title: `${country.name} Passport - Rankings & Visa Data`,
      description: `${country.name} passport ranked #${ranking?.rank || 'N/A'} with ${ranking?.mobilityScore || 0} visa-free destinations.`,
      url: `https://borderiq.io/country/${slug}`,
      images: [{
        url: `https://flagcdn.com/w1280/${country.code.toLowerCase()}.png`,
        width: 1280,
        height: 853,
        alt: `${country.name} flag`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${country.name} Passport - BorderIQ`,
      description: `Ranked #${ranking?.rank || 'N/A'} globally with ${ranking?.mobilityScore || 0} visa-free destinations.`,
      images: [`https://flagcdn.com/w1280/${country.code.toLowerCase()}.png`],
    },
  };
}

function resolveDestinations(names: string[]): { name: string; code: string; slug: string }[] {
  return names
    .map((name) => {
      const meta = getCountryByName(name);
      if (!meta) return null;
      return { name: meta.name, code: meta.code, slug: slugify(meta.name) };
    })
    .filter(Boolean) as { name: string; code: string; slug: string }[];
}

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) notFound();

  const visaData = getVisaData();
  const detail = getCountryDetail(visaData, country.name);
  if (!detail) notFound();

  const { meta, ranking } = detail;

  // Resolve destination lists to objects with code and slug
  const visaFreeResolved = resolveDestinations(detail.visaFree);
  const visaOnArrivalResolved = resolveDestinations(detail.visaOnArrival);
  const etaResolved = resolveDestinations(detail.eta);
  const eVisaResolved = resolveDestinations(detail.eVisa);
  const visaRequiredResolved = resolveDestinations(detail.visaRequired);

  const allRankings = getRankings();
  const faqs = getCountryFAQs(country.name, ranking);
  const sameRegion = getSameRegionCountries(country.name, allRankings, 5);
  const similarRank = getSimilarRankCountries(country.name, allRankings, 5);
  const relatedCompares = getRelatedComparePagesForCountry(country.name, 6);

  return (
    <div className="min-h-screen bg-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Country',
            name: meta.name,
            identifier: meta.code,
            url: `https://borderiq.io/country/${slug}`,
            containedInPlace: { '@type': 'Place', name: meta.region },
            additionalProperty: [
              { '@type': 'PropertyValue', name: 'Passport Power Rank', value: ranking.rank },
              { '@type': 'PropertyValue', name: 'Mobility Score', value: ranking.mobilityScore },
              { '@type': 'PropertyValue', name: 'Visa-Free Destinations', value: ranking.visaFreeCount },
            ],
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
              { '@type': 'ListItem', position: 2, name: 'Countries', item: 'https://borderiq.io/countries' },
              { '@type': 'ListItem', position: 3, name: meta.name, item: `https://borderiq.io/country/${slug}` },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getFAQSchema(faqs)) }}
      />
      {/* ===== Hero Section ===== */}
      <section className="relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800" />
        <div className="absolute top-0 left-1/4 w-[300px] sm:w-[450px] lg:w-[600px] h-[200px] sm:h-[300px] lg:h-[400px] bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[200px] sm:w-[300px] lg:w-[400px] h-[150px] sm:h-[225px] lg:h-[300px] bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-20 pb-10 sm:pb-16">
          {/* Back link */}
          <Link
            href="/rankings"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Rankings
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-5 sm:gap-8">
            {/* Flag */}
            <div className="relative flex-shrink-0">
              <div className="w-[120px] h-[90px] sm:w-[160px] sm:h-[120px] relative rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <Image
                  src={`https://flagcdn.com/w320/${meta.code.toLowerCase()}.png`}
                  alt={`${meta.name} flag`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white">
                  {meta.name}
                </h1>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-gray-300 border border-white/10">
                  {meta.region}
                </span>
              </div>

              <p className="text-gray-400 text-lg mb-4">
                {meta.subregion} &middot; {meta.code3}
              </p>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                {/* Rank badge */}
                <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-teal-500/10 border border-teal-500/20">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                  <span className="text-teal-400 font-bold text-base sm:text-lg">
                    #{ranking.rank}
                  </span>
                  <span className="text-teal-400/70 text-xs sm:text-sm">in the world</span>
                </div>

                {/* Mobility Score */}
                <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  <span className="text-blue-400 font-bold text-base sm:text-lg">
                    {ranking.mobilityScore}
                  </span>
                  <span className="text-blue-400/70 text-xs sm:text-sm">Mobility Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Quick Stats Grid ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 pb-8 sm:pb-12">
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {/* Visa Free */}
          <div className="rounded-lg sm:rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-3xl font-bold text-emerald-400">
              {ranking.visaFreeCount}
            </p>
            <p className="text-gray-400 text-[10px] sm:text-sm mt-0.5 sm:mt-1">Visa Free</p>
          </div>

          {/* Visa on Arrival */}
          <div className="rounded-lg sm:rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-3xl font-bold text-teal-400">
              {ranking.visaOnArrivalCount}
            </p>
            <p className="text-gray-400 text-[10px] sm:text-sm mt-0.5 sm:mt-1">VOA</p>
          </div>

          {/* ETA */}
          <div className="rounded-lg sm:rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-3xl font-bold text-blue-400">
              {ranking.etaCount}
            </p>
            <p className="text-gray-400 text-[10px] sm:text-sm mt-0.5 sm:mt-1">ETA</p>
          </div>

          {/* e-Visa */}
          <div className="rounded-lg sm:rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-3xl font-bold text-yellow-400">
              {ranking.eVisaCount}
            </p>
            <p className="text-gray-400 text-[10px] sm:text-sm mt-0.5 sm:mt-1">e-Visa</p>
          </div>

          {/* Visa Required */}
          <div className="rounded-lg sm:rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-3xl font-bold text-red-400">
              {ranking.visaRequiredCount}
            </p>
            <p className="text-gray-400 text-[10px] sm:text-sm mt-0.5 sm:mt-1">Visa Req.</p>
          </div>

          {/* No Admission */}
          <div className="rounded-lg sm:rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-3xl font-bold text-gray-400">
              {ranking.noAdmissionCount}
            </p>
            <p className="text-gray-400 text-[10px] sm:text-sm mt-0.5 sm:mt-1">No Admit.</p>
          </div>
        </div>
      </section>

      {/* ===== Destinations Section ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
          Destinations
        </h2>
        <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">
          Where can a {meta.name} passport holder travel?
        </p>

        <div className="rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-6">
          <DestinationTabs
            visaFree={visaFreeResolved}
            visaOnArrival={visaOnArrivalResolved}
            eta={etaResolved}
            eVisa={eVisaResolved}
            visaRequired={visaRequiredResolved}
          />
        </div>
      </section>

      {/* ===== Welcoming Score ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/10 p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                Welcoming Score: {detail.welcomingScore}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {meta.name} welcomes travelers from{" "}
                <span className="text-purple-400 font-semibold">
                  {detail.welcomingScore}
                </span>{" "}
                different passports without requiring a traditional visa (visa-free,
                visa on arrival, or ETA). This measures how open {meta.name} is to
                international visitors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Content Section ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4">
          {meta.name} Passport Visa-Free Countries 2026
        </h2>
        <div className="text-gray-400 leading-relaxed space-y-3">
          <p>
            The {meta.name} passport is ranked <strong className="text-white">#{ranking.rank}</strong> in the
            world in 2026, with a mobility score of <strong className="text-white">{ranking.mobilityScore}</strong>.
            {meta.name} passport holders can travel to <strong className="text-teal-400">{ranking.visaFreeCount}</strong> countries
            visa-free, <strong className="text-teal-400">{ranking.visaOnArrivalCount}</strong> with visa on arrival,
            and <strong className="text-teal-400">{ranking.etaCount}</strong> with electronic travel authorization (ETA).
          </p>
          <p>
            Located in {meta.subregion} ({meta.region}), the {meta.name} passport
            requires a traditional visa or e-visa for {ranking.visaRequiredCount + ranking.eVisaCount} destinations.
            {meta.name} also welcomes travelers from {detail.welcomingScore} different
            passports without requiring a traditional visa.
          </p>
        </div>
      </section>

      {/* ===== FAQ Section ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          {faqs.map((faq, i) => (
            <details key={i} className="group mb-3 last:mb-0">
              <summary className="cursor-pointer text-gray-300 hover:text-white font-medium py-2 px-3 rounded-lg hover:bg-white/5 transition-colors list-none flex items-center justify-between">
                {faq.question}
                <ArrowRight className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0" />
              </summary>
              <p className="text-gray-400 text-sm leading-relaxed px-3 pb-2 pt-1">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ===== Internal Links ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Same region */}
          {sameRegion.length > 0 && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {meta.region} Passports
              </h3>
              <div className="space-y-2">
                {sameRegion.map(r => (
                  <Link
                    key={r.country}
                    href={`/country/${r.slug}`}
                    className="flex items-center justify-between text-sm text-gray-300 hover:text-teal-400 transition-colors"
                  >
                    <span>{r.country}</span>
                    <span className="text-gray-500 text-xs">#{r.rank} &middot; {r.mobilityScore}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Similar rank */}
          {similarRank.length > 0 && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Similar Ranked Passports
              </h3>
              <div className="space-y-2">
                {similarRank.map(r => (
                  <Link
                    key={r.country}
                    href={`/country/${r.slug}`}
                    className="flex items-center justify-between text-sm text-gray-300 hover:text-teal-400 transition-colors"
                  >
                    <span>{r.country}</span>
                    <span className="text-gray-500 text-xs">#{r.rank} &middot; {r.mobilityScore}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Compare pages */}
          {relatedCompares.length > 0 && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Compare {meta.name}
              </h3>
              <div className="space-y-2">
                {relatedCompares.map(({ pair, countryA, countryB }) => (
                  <Link
                    key={pair}
                    href={`/compare/${pair}`}
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-teal-400 transition-colors"
                  >
                    <GitCompare className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    {countryA} vs {countryB}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== Compare CTA ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-12 sm:pb-20">
        <div className="rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-8 text-center">
          <GitCompare className="w-8 h-8 sm:w-10 sm:h-10 text-teal-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Compare this passport
          </h3>
          <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 max-w-lg mx-auto">
            See how the {meta.name} passport stacks up against others. Compare
            visa-free access, mobility scores, and discover unique advantages.
          </p>
          <Link
            href={`/compare?country=${slug}`}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-400 transition-colors duration-200 text-base sm:text-lg"
          >
            <GitCompare className="w-5 h-5" />
            Compare {meta.name}
          </Link>
        </div>
      </section>
    </div>
  );
}
