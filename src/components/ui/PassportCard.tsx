"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import CountryFlag from "./CountryFlag";

interface PassportCardProps {
  country: string;
  code: string;
  rank: number;
  mobilityScore: number;
  slug: string;
}

function getScoreColor(score: number): string {
  if (score >= 150) return "bg-emerald-500";
  if (score >= 100) return "bg-yellow-500";
  return "bg-red-500";
}

function getScoreTextColor(score: number): string {
  if (score >= 150) return "text-emerald-400";
  if (score >= 100) return "text-yellow-400";
  return "text-red-400";
}

export default function PassportCard({
  country,
  code,
  rank,
  mobilityScore,
  slug,
}: PassportCardProps) {
  return (
    <Link href={`/country/${slug}`}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative rounded-xl bg-white/5 border border-white/10 p-4 sm:p-5 cursor-pointer hover:border-white/20 transition-colors duration-200 group w-full"
      >
        {/* Score color indicator bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${getScoreColor(mobilityScore)}`}
        />

        <div className="flex items-start justify-between gap-3 mt-1">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <CountryFlag code={code} size="lg" />
            <div className="min-w-0">
              <h3 className="text-white font-semibold text-base sm:text-lg truncate group-hover:text-blue-300 transition-colors">
                {country}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm font-mono">{code.toUpperCase()}</p>
            </div>
          </div>

          <div className="flex-shrink-0 bg-white/10 rounded-lg px-2.5 sm:px-3 py-1 text-center">
            <span className="text-gray-400 text-[10px] sm:text-xs block">Rank</span>
            <span className="text-white font-bold text-base sm:text-lg">#{rank}</span>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 flex items-center justify-between">
          <span className="text-gray-400 text-xs sm:text-sm">Mobility Score</span>
          <span className={`font-bold text-lg sm:text-xl ${getScoreTextColor(mobilityScore)}`}>
            {mobilityScore}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
