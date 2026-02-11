import { NextRequest, NextResponse } from 'next/server';
import { getRankings, getVisaData } from '@/lib/load-data';
import { COUNTRIES, slugify } from '@/lib/countries';

// Priority: lower number = better access
const VISA_PRIORITY: Record<string, number> = {
  'visa-free': 1,
  'voa': 2,
  'eta': 3,
  'e-visa': 4,
  'visa-required': 5,
  'no-admission': 6,
};

function classifyRequirement(req: string): string {
  const r = req.trim().toLowerCase();
  const num = parseInt(r);
  if (r === 'visa free' || (!isNaN(num) && num > 0)) return 'visa-free';
  if (r === 'visa on arrival') return 'voa';
  if (r === 'eta') return 'eta';
  if (r === 'e-visa') return 'e-visa';
  if (r === 'no admission') return 'no-admission';
  return 'visa-required';
}

function isMobilityPositive(cat: string): boolean {
  return cat === 'visa-free' || cat === 'voa' || cat === 'eta';
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const countriesParam = searchParams.get('countries');

  if (!countriesParam) {
    return NextResponse.json(
      { error: 'Missing countries parameter. Provide comma-separated country names.' },
      { status: 400 }
    );
  }

  const countryNames = countriesParam.split(',').map(c => c.trim()).filter(Boolean);

  if (countryNames.length < 2) {
    return NextResponse.json({ error: 'At least 2 countries are required.' }, { status: 400 });
  }
  if (countryNames.length > 4) {
    return NextResponse.json({ error: 'Maximum 4 countries.' }, { status: 400 });
  }

  const invalidCountries = countryNames.filter(name => !COUNTRIES[name]);
  if (invalidCountries.length > 0) {
    return NextResponse.json(
      { error: `Unknown countries: ${invalidCountries.join(', ')}` },
      { status: 400 }
    );
  }

  const visaData = getVisaData();
  const allRankings = getRankings();

  // Per-country ranking data
  const rankings: Record<string, (typeof allRankings)[number]> = {};
  for (const name of countryNames) {
    const ranking = allRankings.find(r => r.country === name);
    if (ranking) rankings[name] = ranking;
  }

  // Build per-passport access map: passport -> destination -> category
  const accessMap: Record<string, Record<string, string>> = {};
  for (const name of countryNames) {
    accessMap[name] = {};
  }

  for (const entry of visaData) {
    if (entry.requirement === '-1') continue;
    if (!countryNames.includes(entry.passport)) continue;
    accessMap[entry.passport][entry.destination] = classifyRequirement(entry.requirement);
  }

  // All destinations (excluding the selected passports themselves)
  const allDestinations = new Set<string>();
  for (const map of Object.values(accessMap)) {
    for (const dest of Object.keys(map)) {
      if (!countryNames.includes(dest)) {
        allDestinations.add(dest);
      }
    }
  }

  // Build combined destination table:
  // For each destination, find the best visa status across all passports
  interface DestinationEntry {
    destination: string;
    code: string;
    slug: string;
    bestStatus: string;
    bestPassport: string;
    perPassport: Record<string, string>; // passport name -> status
  }

  const destinationTable: DestinationEntry[] = [];
  const combinedStats = {
    visaFree: 0,
    voa: 0,
    eta: 0,
    eVisa: 0,
    visaRequired: 0,
    noAdmission: 0,
  };

  // Individual stats
  const individualStats: Record<string, typeof combinedStats> = {};
  for (const name of countryNames) {
    individualStats[name] = { visaFree: 0, voa: 0, eta: 0, eVisa: 0, visaRequired: 0, noAdmission: 0 };
  }

  for (const dest of Array.from(allDestinations).sort()) {
    const destMeta = COUNTRIES[dest];
    if (!destMeta) continue;

    const perPassport: Record<string, string> = {};
    let bestStatus = 'no-admission';
    let bestPassport = countryNames[0];
    let bestPriority = 99;

    for (const passport of countryNames) {
      const status = accessMap[passport][dest] || 'no-admission';
      perPassport[passport] = status;

      // Track individual stats
      const iStats = individualStats[passport];
      if (status === 'visa-free') iStats.visaFree++;
      else if (status === 'voa') iStats.voa++;
      else if (status === 'eta') iStats.eta++;
      else if (status === 'e-visa') iStats.eVisa++;
      else if (status === 'no-admission') iStats.noAdmission++;
      else iStats.visaRequired++;

      const priority = VISA_PRIORITY[status] ?? 99;
      if (priority < bestPriority) {
        bestPriority = priority;
        bestStatus = status;
        bestPassport = passport;
      }
    }

    destinationTable.push({
      destination: dest,
      code: destMeta.code,
      slug: slugify(dest),
      bestStatus,
      bestPassport,
      perPassport,
    });

    // Combined stats use the best status
    if (bestStatus === 'visa-free') combinedStats.visaFree++;
    else if (bestStatus === 'voa') combinedStats.voa++;
    else if (bestStatus === 'eta') combinedStats.eta++;
    else if (bestStatus === 'e-visa') combinedStats.eVisa++;
    else if (bestStatus === 'no-admission') combinedStats.noAdmission++;
    else combinedStats.visaRequired++;
  }

  const combinedMobilityScore = combinedStats.visaFree + combinedStats.voa + combinedStats.eta;

  // Find combined rank: where would this combined score place among real passports?
  let combinedRank = 1;
  for (const r of allRankings) {
    if (r.mobilityScore > combinedMobilityScore) {
      combinedRank = r.rank + 1;
    } else {
      break;
    }
  }

  // Gains from combining
  const individualScores = countryNames.map(n => rankings[n]?.mobilityScore || 0);
  const maxIndividualScore = Math.max(...individualScores);
  const gainFromCombining = combinedMobilityScore - maxIndividualScore;

  return NextResponse.json({
    countries: countryNames,
    rankings,
    combinedMobilityScore,
    combinedRank,
    combinedStats,
    individualStats,
    gainFromCombining,
    maxIndividualScore,
    destinationTable,
  });
}
