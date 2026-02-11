import { COUNTRIES, slugify, type CountryMeta } from './countries';
import type { PassportRanking } from './data';

// ─── Pair slug helpers ───────────────────────────────────────────────
export function pairSlug(a: string, b: string): string {
  const sorted = [slugify(a), slugify(b)].sort();
  return `${sorted[0]}-vs-${sorted[1]}`;
}

export function parsePairSlug(slug: string): [string, string] | null {
  const parts = slug.split('-vs-');
  if (parts.length !== 2) return null;
  const a = Object.values(COUNTRIES).find(c => slugify(c.name) === parts[0]);
  const b = Object.values(COUNTRIES).find(c => slugify(c.name) === parts[1]);
  if (!a || !b) return null;
  return [a.name, b.name];
}

// ─── Top country pairs for static generation (~200) ──────────────────
const TOP_PASSPORTS = [
  'United Arab Emirates', 'Germany', 'Spain', 'France', 'Italy', 'Japan',
  'Singapore', 'South Korea', 'Finland', 'Sweden', 'Austria', 'Denmark',
  'Netherlands', 'United Kingdom', 'Ireland', 'United States', 'Canada',
  'Australia', 'New Zealand', 'Switzerland', 'Norway', 'Belgium',
  'Portugal', 'Greece', 'Poland', 'Czech Republic', 'Hungary',
  'Malaysia', 'Brazil', 'Argentina',
];

const NEIGHBOR_PAIRS: [string, string][] = [
  ['United States', 'Canada'],
  ['United States', 'Mexico'],
  ['United Kingdom', 'Ireland'],
  ['India', 'Pakistan'],
  ['India', 'Bangladesh'],
  ['India', 'China'],
  ['China', 'Japan'],
  ['China', 'South Korea'],
  ['Japan', 'South Korea'],
  ['Turkey', 'Greece'],
  ['Germany', 'France'],
  ['Germany', 'Poland'],
  ['Spain', 'Portugal'],
  ['Australia', 'New Zealand'],
  ['Brazil', 'Argentina'],
  ['Russia', 'Ukraine'],
  ['Saudi Arabia', 'United Arab Emirates'],
  ['Thailand', 'Vietnam'],
  ['South Africa', 'Nigeria'],
  ['Egypt', 'Israel'],
  ['Singapore', 'Malaysia'],
  ['Norway', 'Sweden'],
  ['Italy', 'Switzerland'],
  ['Mexico', 'Brazil'],
  ['Philippines', 'Indonesia'],
  ['Colombia', 'Peru'],
  ['Chile', 'Argentina'],
  ['Qatar', 'Saudi Arabia'],
  ['Israel', 'Turkey'],
  ['Hong Kong', 'Singapore'],
];

function generateTopPairs(): [string, string][] {
  const pairSet = new Set<string>();
  const pairs: [string, string][] = [];

  function addPair(a: string, b: string) {
    if (a === b) return;
    if (!COUNTRIES[a] || !COUNTRIES[b]) return;
    const key = pairSlug(a, b);
    if (pairSet.has(key)) return;
    pairSet.add(key);
    pairs.push([a, b]);
  }

  // Add neighbor pairs first
  for (const [a, b] of NEIGHBOR_PAIRS) {
    addPair(a, b);
  }

  // Cross-match top passports (pick pairs until we hit ~200)
  for (let i = 0; i < TOP_PASSPORTS.length && pairs.length < 200; i++) {
    for (let j = i + 1; j < TOP_PASSPORTS.length && pairs.length < 200; j++) {
      addPair(TOP_PASSPORTS[i], TOP_PASSPORTS[j]);
    }
  }

  return pairs;
}

let _cachedPairs: [string, string][] | null = null;
export function getComparePairs(): [string, string][] {
  if (!_cachedPairs) _cachedPairs = generateTopPairs();
  return _cachedPairs;
}

// ─── FAQ generators ──────────────────────────────────────────────────
export function getCountryFAQs(
  country: string,
  ranking: PassportRanking,
): { question: string; answer: string }[] {
  const score = ranking.mobilityScore;
  const rank = ranking.rank;
  const vfCount = ranking.visaFreeCount;

  return [
    {
      question: `How powerful is the ${country} passport in 2026?`,
      answer: `The ${country} passport is ranked #${rank} in the world in 2026 with a mobility score of ${score}. ${country} passport holders can access ${score} destinations without a pre-departure visa, including ${vfCount} visa-free countries, ${ranking.visaOnArrivalCount} visa-on-arrival destinations, and ${ranking.etaCount} ETA destinations.`,
    },
    {
      question: `How many countries can ${country} passport holders visit visa-free?`,
      answer: `${country} passport holders can visit ${vfCount} countries visa-free (no visa required at all). Additionally, they can access ${ranking.visaOnArrivalCount} countries with visa on arrival and ${ranking.etaCount} with electronic travel authorization, for a total mobility score of ${score}.`,
    },
    {
      question: `Do ${country} citizens need a visa for the United States?`,
      answer: `Check the detailed visa requirements section above for the latest information on whether ${country} citizens need a visa to visit the United States. Requirements can change, so always verify with official sources before traveling.`,
    },
    {
      question: `Do ${country} citizens need a visa for Europe (Schengen Area)?`,
      answer: `Check the detailed visa requirements section above for current Schengen Area visa requirements for ${country} passport holders. The EU's ETIAS system may also affect travel authorization requirements starting in 2026.`,
    },
    {
      question: `What is the ${country} passport ranking in 2026?`,
      answer: `The ${country} passport is ranked #${rank} globally in 2026 based on the BorderIQ Passport Power Index. This ranking is determined by the total number of destinations accessible without a pre-departure visa (visa-free + visa on arrival + ETA = ${score}).`,
    },
  ];
}

export function getCompareFAQs(
  countryA: string,
  countryB: string,
  rankA: number,
  rankB: number,
  scoreA: number,
  scoreB: number,
  sharedCount: number,
): { question: string; answer: string }[] {
  const stronger = scoreA >= scoreB ? countryA : countryB;
  const diff = Math.abs(scoreA - scoreB);

  return [
    {
      question: `Which passport is stronger, ${countryA} or ${countryB}?`,
      answer: `The ${stronger} passport is stronger in 2026. ${countryA} is ranked #${rankA} with a mobility score of ${scoreA}, while ${countryB} is ranked #${rankB} with a score of ${scoreB} — a difference of ${diff} destinations.`,
    },
    {
      question: `How many visa-free destinations do ${countryA} and ${countryB} share?`,
      answer: `${countryA} and ${countryB} passport holders share visa-free or easy access to ${sharedCount} common destinations. See the detailed comparison above for the complete breakdown of shared and unique destinations.`,
    },
    {
      question: `Can I travel with both a ${countryA} and ${countryB} passport?`,
      answer: `If you hold dual citizenship with both ${countryA} and ${countryB}, you can use whichever passport gives better access to each destination. Combining both passports often unlocks more visa-free destinations than either passport alone.`,
    },
    {
      question: `What is the difference between ${countryA} and ${countryB} passport rankings?`,
      answer: `${countryA} is ranked #${rankA} and ${countryB} is ranked #${rankB} in the 2026 BorderIQ Passport Power Index. ${countryA} has a mobility score of ${scoreA} while ${countryB} has ${scoreB}, a difference of ${diff} destinations.`,
    },
    {
      question: `Is it worth having both ${countryA} and ${countryB} passports?`,
      answer: `Having both passports gives you the best visa access from each. While they share ${sharedCount} common easy-access destinations, each passport provides unique access to additional countries. Check the unique destinations section above for the full advantage of holding both.`,
    },
  ];
}

export function getRankingsFAQs(
  topCountry: string,
  topScore: number,
  totalCountries: number,
): { question: string; answer: string }[] {
  return [
    {
      question: 'What is the most powerful passport in 2026?',
      answer: `The most powerful passport in 2026 is ${topCountry} with a mobility score of ${topScore}, meaning its holders can access ${topScore} destinations without a pre-departure visa (visa-free, visa on arrival, or ETA).`,
    },
    {
      question: 'How are passport rankings calculated?',
      answer: `BorderIQ passport rankings are based on the total number of destinations a passport holder can access without obtaining a visa before departure. This includes visa-free entry, visa on arrival (VOA), and electronic travel authorization (ETA). Higher mobility scores indicate greater travel freedom.`,
    },
    {
      question: 'How many passports does BorderIQ rank?',
      answer: `BorderIQ ranks ${totalCountries} passports from countries and territories worldwide. Rankings are based on comprehensive visa requirement data covering over 39,000 country-to-country visa policies.`,
    },
    {
      question: 'How often are passport rankings updated?',
      answer: `BorderIQ passport rankings are updated regularly to reflect the latest visa policy changes worldwide. Visa requirements can change due to new bilateral agreements, policy shifts, or geopolitical events.`,
    },
  ];
}

export function getCombineFAQs(): { question: string; answer: string }[] {
  return [
    {
      question: 'What are the best passport combinations for travel?',
      answer: 'The best passport combinations typically pair a strong European passport (for EU freedom of movement) with a passport that has strong Asian or Middle Eastern access. For example, combining a German or French passport with a Singapore or UAE passport can maximize global coverage.',
    },
    {
      question: 'How does combining passports increase travel power?',
      answer: 'When you hold multiple passports, you can use whichever one grants the best access to each destination. This means your combined mobility score is always equal to or higher than your strongest single passport, as each passport fills in visa-free gaps the other may have.',
    },
    {
      question: 'Can I use two passports to travel?',
      answer: 'Yes, dual (or multiple) citizens can use different passports at different borders. You typically present the passport that gives you the best entry conditions (e.g., visa-free vs. visa required) for each destination. Always enter and exit a country on the same passport.',
    },
  ];
}

export function getExploreFAQs(): { question: string; answer: string }[] {
  return [
    {
      question: 'Why are passports different colors?',
      answer: 'Passport colors are chosen by each country and generally fall into four main colors: red, blue, green, and black. Red is the most common (used by EU countries and others), blue is popular in the Americas, green is common in Muslim-majority countries, and black is relatively rare. The color choice can reflect national identity, cultural significance, or regional affiliations.',
    },
    {
      question: 'Which region has the strongest passports?',
      answer: 'Europe generally has the strongest passports due to EU/Schengen freedom of movement, which grants visa-free access across all EU member states. Many European passports rank in the top 20 globally. Asia also features top-ranked passports including Japan, Singapore, and South Korea.',
    },
    {
      question: 'What does passport color mean?',
      answer: 'While there are no strict international rules, passport colors often reflect regional or political associations. Red passports are common among EU member states, blue is used widely in the Americas and Caribbean, green is traditional in many Muslim-majority and ECOWAS African nations, and black is used by a few countries including New Zealand.',
    },
    {
      question: 'Which passport color is the most powerful?',
      answer: 'Red passports tend to be the most powerful on average, largely because EU member states use burgundy/red passports and many rank highly. However, passport color does not determine its power — the visa-free agreements each country has negotiated determine its ranking.',
    },
  ];
}

export function getAdvisorFAQs(): { question: string; answer: string }[] {
  return [
    {
      question: 'How does the AI visa checker work?',
      answer: 'The BorderIQ AI Visa Checker uses comprehensive visa requirement data for 199 passports to instantly tell you whether you need a visa for your destination. Simply select your passport country and destination to get real-time visa requirement information.',
    },
    {
      question: 'What is ETIAS and when does it start?',
      answer: 'ETIAS (European Travel Information and Authorisation System) is a new travel authorization required for visa-exempt travelers visiting Europe\'s Schengen Area. It is expected to launch in 2026. Citizens of countries like the US, UK, Canada, and Australia will need to apply online before traveling to the Schengen Area.',
    },
    {
      question: 'Do I need a visa to visit Europe?',
      answer: 'Whether you need a visa to visit Europe depends on your passport. Citizens of many countries can visit the Schengen Area visa-free for up to 90 days within a 180-day period. With ETIAS launching in 2026, visa-exempt travelers will also need an electronic travel authorization. Check the visa requirements for your specific passport above.',
    },
    {
      question: 'How accurate is the visa requirement data?',
      answer: 'BorderIQ visa data is sourced from official government publications and verified travel databases covering 199 passports and over 39,000 visa policies. While we strive for accuracy, visa requirements can change. Always verify with official embassy or consulate sources before traveling.',
    },
  ];
}

// ─── Internal linking helpers ────────────────────────────────────────
export function getNeighborCountries(country: string): string[] {
  const neighbors: string[] = [];
  for (const [a, b] of NEIGHBOR_PAIRS) {
    if (a === country) neighbors.push(b);
    else if (b === country) neighbors.push(a);
  }
  return neighbors;
}

export function getSameRegionCountries(
  country: string,
  rankings: PassportRanking[],
  limit = 5,
): PassportRanking[] {
  const meta = COUNTRIES[country];
  if (!meta) return [];
  return rankings
    .filter(r => r.meta.region === meta.region && r.country !== country)
    .slice(0, limit);
}

export function getSimilarRankCountries(
  country: string,
  rankings: PassportRanking[],
  limit = 5,
): PassportRanking[] {
  const target = rankings.find(r => r.country === country);
  if (!target) return [];
  return rankings
    .filter(r => r.country !== country)
    .sort((a, b) => Math.abs(a.mobilityScore - target.mobilityScore) - Math.abs(b.mobilityScore - target.mobilityScore))
    .slice(0, limit);
}

export function getRelatedComparePagesForCountry(
  country: string,
  limit = 6,
): { pair: string; countryA: string; countryB: string }[] {
  const pairs = getComparePairs();
  return pairs
    .filter(([a, b]) => a === country || b === country)
    .slice(0, limit)
    .map(([a, b]) => ({ pair: pairSlug(a, b), countryA: a, countryB: b }));
}

// ─── Region stats helper ─────────────────────────────────────────────
export function getRegionStats(rankings: PassportRanking[]): {
  region: string;
  topPassports: PassportRanking[];
  avgScore: number;
  count: number;
}[] {
  const regionMap = new Map<string, PassportRanking[]>();

  for (const r of rankings) {
    const region = r.meta.region;
    if (!regionMap.has(region)) regionMap.set(region, []);
    regionMap.get(region)!.push(r);
  }

  return Array.from(regionMap.entries())
    .map(([region, passports]) => ({
      region,
      topPassports: passports.slice(0, 3),
      avgScore: Math.round(passports.reduce((s, p) => s + p.mobilityScore, 0) / passports.length),
      count: passports.length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
}

// ─── Color stats helper ──────────────────────────────────────────────
export function getColorStats(rankings: PassportRanking[]): {
  color: string;
  count: number;
  avgScore: number;
  description: string;
}[] {
  const colorMap = new Map<string, PassportRanking[]>();

  for (const r of rankings) {
    const color = r.meta.passportColor;
    if (!colorMap.has(color)) colorMap.set(color, []);
    colorMap.get(color)!.push(r);
  }

  const descriptions: Record<string, string> = {
    red: 'Red passports are the most common worldwide, used by EU member states, Turkey, and many others. The EU adopted burgundy-red as a common passport color for its members.',
    blue: 'Blue passports are widely used across the Americas, Oceania, and many Asian nations. The United States, Canada, Australia, and India all use blue passports.',
    green: 'Green passports are traditional in many Muslim-majority countries and ECOWAS member states in West Africa. Countries like Saudi Arabia, Pakistan, and Morocco use green passports.',
    black: 'Black passports are the rarest color. New Zealand is the most well-known country with a black passport, reflecting its national color.',
  };

  return Array.from(colorMap.entries())
    .map(([color, passports]) => ({
      color,
      count: passports.length,
      avgScore: Math.round(passports.reduce((s, p) => s + p.mobilityScore, 0) / passports.length),
      description: descriptions[color] || '',
    }))
    .sort((a, b) => b.count - a.count);
}
