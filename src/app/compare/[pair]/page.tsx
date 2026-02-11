import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowLeft, Globe, Shield, ArrowRight } from 'lucide-react';
import { getDetailedComparisonData, getRankings } from '@/lib/load-data';
import { COUNTRIES, slugify } from '@/lib/countries';
import { parsePairSlug, getComparePairs, pairSlug, getCompareFAQs } from '@/lib/seo-data';
import { getFAQSchema, getBreadcrumbSchema } from '@/lib/structured-data';

export function generateStaticParams() {
  return getComparePairs().map(([a, b]) => ({ pair: pairSlug(a, b) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pair: string }>;
}): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parsePairSlug(pair);
  if (!parsed) return { title: 'Comparison Not Found' };

  const [a, b] = parsed;
  const rankings = getRankings();
  const rA = rankings.find(r => r.country === a);
  const rB = rankings.find(r => r.country === b);

  const title = `${a} vs ${b} Passport Comparison 2026 | Visa-Free Access`;
  const description = `Compare ${a} (#${rA?.rank}) and ${b} (#${rB?.rank}) passports side by side. ${a} has ${rA?.mobilityScore} visa-free destinations vs ${b} with ${rB?.mobilityScore}. See shared destinations, unique access, and which passport is stronger in 2026.`;

  return {
    title,
    description,
    alternates: { canonical: `https://borderiq.io/compare/${pair}` },
    keywords: [
      `${a} vs ${b} passport`,
      `${a} passport comparison`,
      `${b} passport comparison`,
      `passport comparison 2026`,
      `${a} visa free countries`,
      `${b} visa free countries`,
    ],
    openGraph: {
      title,
      description,
      url: `https://borderiq.io/compare/${pair}`,
    },
  };
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'visa-free': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'voa': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    'eta': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'e-visa': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'visa-required': 'bg-red-500/20 text-red-400 border-red-500/30',
    'no-admission': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  const labels: Record<string, string> = {
    'visa-free': 'Visa Free',
    'voa': 'VOA',
    'eta': 'ETA',
    'e-visa': 'e-Visa',
    'visa-required': 'Visa Req.',
    'no-admission': 'No Admit.',
  };

  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${colors[status] || colors['visa-required']}`}>
      {labels[status] || status}
    </span>
  );
}

export default async function ComparePairPage({
  params,
}: {
  params: Promise<{ pair: string }>;
}) {
  const { pair } = await params;
  const parsed = parsePairSlug(pair);
  if (!parsed) notFound();

  const [countryA, countryB] = parsed;
  const metaA = COUNTRIES[countryA];
  const metaB = COUNTRIES[countryB];
  if (!metaA || !metaB) notFound();

  const comparison = getDetailedComparisonData([countryA, countryB]);
  const rankA = comparison.rankings[countryA];
  const rankB = comparison.rankings[countryB];
  if (!rankA || !rankB) notFound();

  const statsA = comparison.individualStats[countryA];
  const statsB = comparison.individualStats[countryB];

  // Shared easy-access destinations
  const sharedEasy = comparison.destinationTable.filter(d => {
    const sA = d.perPassport[countryA];
    const sB = d.perPassport[countryB];
    const isEasy = (s: string) => s === 'visa-free' || s === 'voa' || s === 'eta';
    return isEasy(sA) && isEasy(sB);
  });

  // Unique easy-access for each
  const uniqueA = comparison.destinationTable.filter(d => {
    const sA = d.perPassport[countryA];
    const sB = d.perPassport[countryB];
    const isEasy = (s: string) => s === 'visa-free' || s === 'voa' || s === 'eta';
    return isEasy(sA) && !isEasy(sB);
  });
  const uniqueB = comparison.destinationTable.filter(d => {
    const sA = d.perPassport[countryA];
    const sB = d.perPassport[countryB];
    const isEasy = (s: string) => s === 'visa-free' || s === 'voa' || s === 'eta';
    return !isEasy(sA) && isEasy(sB);
  });

  const faqs = getCompareFAQs(
    countryA, countryB,
    rankA.rank, rankB.rank,
    rankA.mobilityScore, rankB.mobilityScore,
    sharedEasy.length,
  );

  // Related compare pages
  const allPairs = getComparePairs();
  const relatedPairs = allPairs
    .filter(([a, b]) => {
      const slug = pairSlug(a, b);
      return slug !== pair && (a === countryA || b === countryA || a === countryB || b === countryB);
    })
    .slice(0, 6);

  const stronger = rankA.mobilityScore >= rankB.mobilityScore ? countryA : countryB;
  const diff = Math.abs(rankA.mobilityScore - rankB.mobilityScore);

  return (
    <div className="min-h-screen bg-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getFAQSchema(faqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBreadcrumbSchema([
            { name: 'Home', url: 'https://borderiq.io' },
            { name: 'Compare', url: 'https://borderiq.io/compare' },
            { name: `${countryA} vs ${countryB}`, url: `https://borderiq.io/compare/${pair}` },
          ])),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800" />
        <div className="absolute top-0 left-1/4 w-[400px] h-[300px] bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-10 sm:pb-16">
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Compare Tool
          </Link>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-white via-teal-200 to-teal-400 bg-clip-text text-transparent">
              {countryA} vs {countryB}
            </span>
            <span className="text-teal-400 text-lg sm:text-2xl lg:text-3xl ml-2">Passport Comparison 2026</span>
          </h1>

          <p className="text-gray-400 text-sm sm:text-lg max-w-3xl leading-relaxed">
            Side-by-side comparison of {countryA} and {countryB} passports.
            The {stronger} passport is stronger by {diff} destination{diff !== 1 ? 's' : ''}.
          </p>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { country: countryA, meta: metaA, rank: rankA, stats: statsA },
            { country: countryB, meta: metaB, rank: rankB, stats: statsB },
          ].map(({ country, meta, rank, stats }) => (
            <div key={country} className="rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-12 relative rounded-lg overflow-hidden border border-white/10">
                  <Image
                    src={`https://flagcdn.com/w160/${meta.code.toLowerCase()}.png`}
                    alt={`${country} flag`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <Link href={`/country/${slugify(country)}`} className="text-xl font-bold text-white hover:text-teal-400 transition-colors">
                    {country}
                  </Link>
                  <p className="text-gray-400 text-sm">{meta.region}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center rounded-lg bg-white/5 p-2">
                  <p className="text-lg font-bold text-teal-400">#{rank.rank}</p>
                  <p className="text-gray-400 text-[10px]">Rank</p>
                </div>
                <div className="text-center rounded-lg bg-white/5 p-2">
                  <p className="text-lg font-bold text-blue-400">{rank.mobilityScore}</p>
                  <p className="text-gray-400 text-[10px]">Mobility</p>
                </div>
                <div className="text-center rounded-lg bg-white/5 p-2">
                  <p className="text-lg font-bold text-emerald-400">{stats.visaFree}</p>
                  <p className="text-gray-400 text-[10px]">Visa Free</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Visual Bar Comparison */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-white mb-6">Category Breakdown</h2>
          {[
            { label: 'Visa Free', keyA: statsA.visaFree, keyB: statsB.visaFree, color: 'bg-emerald-500' },
            { label: 'Visa on Arrival', keyA: statsA.voa, keyB: statsB.voa, color: 'bg-teal-500' },
            { label: 'ETA', keyA: statsA.eta, keyB: statsB.eta, color: 'bg-blue-500' },
            { label: 'e-Visa', keyA: statsA.eVisa, keyB: statsB.eVisa, color: 'bg-yellow-500' },
            { label: 'Visa Required', keyA: statsA.visaRequired, keyB: statsB.visaRequired, color: 'bg-red-500' },
          ].map(({ label, keyA, keyB, color }) => {
            const max = Math.max(keyA, keyB, 1);
            return (
              <div key={label} className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>{label}</span>
                  <span>{keyA} vs {keyB}</span>
                </div>
                <div className="flex gap-1">
                  <div className="flex-1 bg-white/5 rounded-l-full h-4 overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-l-full transition-all`}
                      style={{ width: `${(keyA / max) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 bg-white/5 rounded-r-full h-4 overflow-hidden flex justify-end">
                    <div
                      className={`h-full ${color} rounded-r-full transition-all`}
                      style={{ width: `${(keyB / max) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                  <span>{countryA}</span>
                  <span>{countryB}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Combined Power */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/10 p-5 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-2">Combined Passport Power</h2>
          <p className="text-gray-400 text-sm mb-4">
            If you held both passports, your combined travel power would be:
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center rounded-xl bg-white/5 p-3">
              <p className="text-2xl font-bold text-purple-400">#{comparison.combinedRank}</p>
              <p className="text-gray-400 text-xs">Combined Rank</p>
            </div>
            <div className="text-center rounded-xl bg-white/5 p-3">
              <p className="text-2xl font-bold text-blue-400">{comparison.combinedMobilityScore}</p>
              <p className="text-gray-400 text-xs">Combined Score</p>
            </div>
            <div className="text-center rounded-xl bg-white/5 p-3">
              <p className="text-2xl font-bold text-emerald-400">+{comparison.gainFromCombining}</p>
              <p className="text-gray-400 text-xs">Extra Destinations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shared Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-white mb-1">
            Shared Easy-Access Destinations ({sharedEasy.length})
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Both passport holders can visit these destinations visa-free, with VOA, or ETA.
          </p>
          <div className="flex flex-wrap gap-2">
            {sharedEasy.slice(0, 60).map(d => (
              <Link
                key={d.destination}
                href={`/country/${d.slug}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:border-teal-500/30 transition-colors"
              >
                <Image
                  src={`https://flagcdn.com/w20/${d.code.toLowerCase()}.png`}
                  alt=""
                  width={16}
                  height={12}
                  className="rounded-sm"
                />
                {d.destination}
              </Link>
            ))}
            {sharedEasy.length > 60 && (
              <span className="px-2.5 py-1 text-sm text-gray-500">
                +{sharedEasy.length - 60} more
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Unique Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { country: countryA, unique: uniqueA, meta: metaA },
            { country: countryB, unique: uniqueB, meta: metaB },
          ].map(({ country, unique, meta }) => (
            <div key={country} className="rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6">
              <h3 className="text-lg font-bold text-white mb-1">
                Unique to {country} ({unique.length})
              </h3>
              <p className="text-gray-400 text-xs mb-3">
                Destinations only {country} passport holders can access easily
              </p>
              <div className="flex flex-wrap gap-1.5">
                {unique.slice(0, 30).map(d => (
                  <Link
                    key={d.destination}
                    href={`/country/${d.slug}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white transition-colors"
                  >
                    <Image
                      src={`https://flagcdn.com/w20/${d.code.toLowerCase()}.png`}
                      alt=""
                      width={14}
                      height={10}
                      className="rounded-sm"
                    />
                    {d.destination}
                    <StatusBadge status={d.perPassport[country]} />
                  </Link>
                ))}
                {unique.length > 30 && (
                  <span className="px-2 py-0.5 text-xs text-gray-500">
                    +{unique.length - 30} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          {faqs.map((faq, i) => (
            <details key={i} className="group mb-3 last:mb-0">
              <summary className="cursor-pointer text-gray-300 hover:text-white font-medium py-2 px-3 rounded-lg hover:bg-white/5 transition-colors list-none flex items-center justify-between">
                {faq.question}
                <ArrowRight className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-400 text-sm leading-relaxed px-3 pb-2 pt-1">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Internal Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Country pages */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Country Details</h3>
            <div className="space-y-2">
              {[
                { country: countryA, meta: metaA },
                { country: countryB, meta: metaB },
              ].map(({ country, meta }) => (
                <Link
                  key={country}
                  href={`/country/${slugify(country)}`}
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-teal-400 transition-colors"
                >
                  <Image
                    src={`https://flagcdn.com/w20/${meta.code.toLowerCase()}.png`}
                    alt=""
                    width={16}
                    height={12}
                    className="rounded-sm"
                  />
                  {country} Passport Details
                  <ArrowRight className="w-3 h-3 ml-auto" />
                </Link>
              ))}
            </div>
          </div>

          {/* Related comparisons */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Related Comparisons</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {relatedPairs.map(([a, b]) => (
                <Link
                  key={pairSlug(a, b)}
                  href={`/compare/${pairSlug(a, b)}`}
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-teal-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
                >
                  <Globe className="w-3.5 h-3.5 text-gray-500" />
                  {a} vs {b}
                  <ArrowRight className="w-3 h-3 ml-auto" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Compare CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-8 text-center">
          <Shield className="w-8 h-8 text-teal-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">
            Compare Any Passports
          </h3>
          <p className="text-gray-400 text-sm mb-4 max-w-lg mx-auto">
            Use our interactive comparison tool to compare up to 4 passports with detailed destination breakdowns.
          </p>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-400 transition-colors"
          >
            Open Compare Tool
          </Link>
        </div>
      </section>
    </div>
  );
}
