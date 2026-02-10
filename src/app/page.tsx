import Link from "next/link";
import { Trophy, GitCompare, Bot, Globe, Shield, TrendingUp, Map } from "lucide-react";
import { getRankings, getWelcomingRanks } from "@/lib/load-data";

import PassportCard from "@/components/ui/PassportCard";
import WorldMapWrapper from "@/components/features/WorldMapWrapper";

export default function Home() {
  const rankings = getRankings();
  const welcomingRanks = getWelcomingRanks();
  const top10 = rankings.slice(0, 10);

  // Quick stats
  const strongestPassport = rankings[0];
  const weakestPassport = rankings[rankings.length - 1];
  const mostWelcoming = welcomingRanks[0];
  const totalPolicies = rankings.reduce(
    (sum, r) =>
      sum +
      r.visaFreeCount +
      r.visaOnArrivalCount +
      r.etaCount +
      r.eVisaCount +
      r.visaRequiredCount +
      r.noAdmissionCount,
    0
  );
  const avgMobility = Math.round(
    rankings.reduce((sum, r) => sum + r.mobilityScore, 0) / rankings.length
  );

  return (
    <div className="min-h-screen bg-slate-900">
      {/* ===== Hero Section ===== */}
      <section className="relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] lg:w-[800px] h-[300px] sm:h-[450px] lg:h-[600px] bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[200px] sm:w-[300px] lg:w-[400px] h-[200px] sm:h-[300px] lg:h-[400px] bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-12 sm:pb-16 lg:pb-20 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Globe className="w-6 h-6 text-teal-400" />
            <span className="text-teal-400 font-medium tracking-wide uppercase text-sm">
              BorderIQ.io
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-white via-teal-200 to-teal-400 bg-clip-text text-transparent">
              Global Passport
            </span>
            <br />
            <span className="bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Intelligence
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            Explore the world&apos;s 199 passports. Compare visa-free access,
            track mobility changes, and discover your passport&apos;s true power.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-16">
            <Link
              href="/rankings"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-400 transition-colors duration-200 text-lg"
            >
              <Trophy className="w-5 h-5" />
              Explore Rankings
            </Link>
            <Link
              href="/compare"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/20 transition-colors duration-200 text-lg"
            >
              <GitCompare className="w-5 h-5" />
              Compare Passports
            </Link>
          </div>

          {/* Big stats row */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-6">
              <p className="text-2xl sm:text-4xl font-bold text-white">199</p>
              <p className="text-gray-400 text-xs sm:text-base mt-1">Passports</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-6">
              <p className="text-2xl sm:text-4xl font-bold text-teal-400">
                {totalPolicies.toLocaleString()}+
              </p>
              <p className="text-gray-400 text-xs sm:text-base mt-1">Visa Policies</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-6">
              <p className="text-2xl sm:text-4xl font-bold text-blue-400">Real-time</p>
              <p className="text-gray-400 text-xs sm:text-base mt-1">Data</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Interactive World Map Section ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Map className="w-5 h-5 text-teal-400" />
            <span className="text-teal-400 font-medium text-sm uppercase tracking-wide">
              Interactive Map
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Visa Access World Map
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Select your passport to see where you can travel visa-free.
            Countries are color-coded by visa requirement type.
          </p>
        </div>

        <WorldMapWrapper />
      </section>

      {/* ===== Top 10 Passports Section ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
            Most Powerful Passports 2026
          </h2>
          <p className="text-gray-400 text-sm sm:text-lg">
            The top 10 passports ranked by visa-free mobility score
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          {top10.map((passport) => (
            <PassportCard
              key={passport.country}
              country={passport.country}
              code={passport.meta.code}
              rank={passport.rank}
              mobilityScore={passport.mobilityScore}
              slug={passport.slug}
            />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/rankings"
            className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-medium transition-colors"
          >
            View full rankings
            <TrendingUp className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section className="bg-slate-800/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
              Powerful Tools for Global Travelers
            </h2>
            <p className="text-gray-400 text-sm sm:text-lg">
              Everything you need to understand passport power and plan your travels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            {/* Feature 1: Passport Rankings */}
            <div className="group rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-8 hover:border-teal-500/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5 group-hover:bg-teal-500/20 transition-colors">
                <Trophy className="w-7 h-7 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Passport Rankings
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Real-time power rankings for all 199 passports. See how every
                country stacks up by visa-free access, mobility score, and
                regional influence.
              </p>
              <Link
                href="/rankings"
                className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 mt-4 font-medium text-sm transition-colors"
              >
                View Rankings
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            {/* Feature 2: Smart Compare */}
            <div className="group rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-8 hover:border-blue-500/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5 group-hover:bg-blue-500/20 transition-colors">
                <GitCompare className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Smart Compare
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Compare any passports side by side. See shared visa-free
                destinations, unique access advantages, and detailed breakdowns
                at a glance.
              </p>
              <Link
                href="/compare"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 mt-4 font-medium text-sm transition-colors"
              >
                Compare Now
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            {/* Feature 3: AI Travel Advisor */}
            <div className="group rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-8 hover:border-purple-500/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-5 group-hover:bg-purple-500/20 transition-colors">
                <Bot className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                AI Travel Advisor
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Get personalized visa guidance powered by AI. Ask questions about
                travel requirements, visa processes, and entry rules for any
                destination.
              </p>
              <Link
                href="/advisor"
                className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 mt-4 font-medium text-sm transition-colors"
              >
                Try Advisor
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Quick Stats Section ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
            Quick Stats
          </h2>
          <p className="text-gray-400 text-sm sm:text-lg">
            Interesting facts from our global passport data
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Strongest passport */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-gray-400 text-sm">Strongest Passport</span>
            </div>
            <Link
              href={`/country/${strongestPassport.slug}`}
              className="hover:underline"
            >
              <p className="text-2xl font-bold text-white">
                {strongestPassport.country}
              </p>
            </Link>
            <p className="text-emerald-400 text-sm mt-1">
              {strongestPassport.mobilityScore} destinations visa-free
            </p>
          </div>

          {/* Most welcoming */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-teal-400" />
              </div>
              <span className="text-gray-400 text-sm">Most Welcoming</span>
            </div>
            <Link
              href={`/country/${mostWelcoming.slug}`}
              className="hover:underline"
            >
              <p className="text-2xl font-bold text-white">
                {mostWelcoming.country}
              </p>
            </Link>
            <p className="text-teal-400 text-sm mt-1">
              Welcomes {mostWelcoming.score} passports
            </p>
          </div>

          {/* Average mobility */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-gray-400 text-sm">Average Mobility</span>
            </div>
            <p className="text-2xl font-bold text-white">{avgMobility}</p>
            <p className="text-blue-400 text-sm mt-1">
              Destinations per passport
            </p>
          </div>

          {/* Least powerful */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-gray-400 text-sm">Most Restricted</span>
            </div>
            <Link
              href={`/country/${weakestPassport.slug}`}
              className="hover:underline"
            >
              <p className="text-2xl font-bold text-white">
                {weakestPassport.country}
              </p>
            </Link>
            <p className="text-red-400 text-sm mt-1">
              {weakestPassport.mobilityScore} destinations visa-free
            </p>
          </div>
        </div>
      </section>

      {/* ===== Footer CTA ===== */}
      <section className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4">
            Ready to explore passport power?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Dive into the data. Compare passports, discover rankings, and plan
            your next adventure with real-time visa intelligence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/rankings"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-400 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/compare"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/20 transition-colors"
            >
              Compare Passports
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
