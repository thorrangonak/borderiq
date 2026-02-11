import { COUNTRIES, type CountryMeta, slugify } from './countries';

export type VisaRequirement =
  | 'visa free'
  | 'visa on arrival'
  | 'eta'
  | 'e-visa'
  | 'visa required'
  | 'no admission'
  | string; // numeric days like "30", "90", "180"

export interface VisaEntry {
  passport: string;
  destination: string;
  requirement: VisaRequirement;
}

export interface PassportRanking {
  rank: number;
  country: string;
  meta: CountryMeta;
  visaFreeCount: number;
  visaOnArrivalCount: number;
  etaCount: number;
  eVisaCount: number;
  visaRequiredCount: number;
  noAdmissionCount: number;
  mobilityScore: number;
  slug: string;
}

export interface CountryDetail {
  country: string;
  meta: CountryMeta;
  ranking: PassportRanking;
  visaFree: string[];
  visaOnArrival: string[];
  eta: string[];
  eVisa: string[];
  visaRequired: string[];
  noAdmission: string[];
  welcomingScore: number; // how many passports this country accepts visa-free
}

// Parse the tidy CSV data
let _visaData: VisaEntry[] | null = null;
let _rankings: PassportRanking[] | null = null;
let _welcomingRanks: { country: string; meta: CountryMeta; score: number; slug: string }[] | null = null;

function isVisaFreeRequirement(req: string): boolean {
  if (req === 'visa free') return true;
  const num = parseInt(req);
  return !isNaN(num) && num > 0;
}

function isMobilityPositive(req: string): boolean {
  return isVisaFreeRequirement(req) || req === 'visa on arrival' || req === 'eta';
}

export function parseVisaData(csvText: string): VisaEntry[] {
  if (_visaData) return _visaData;

  const lines = csvText.trim().split('\n');
  const entries: VisaEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 3) {
      entries.push({
        passport: parts[0],
        destination: parts[1],
        requirement: parts.slice(2).join(',').trim(), // handle commas in values
      });
    }
  }

  _visaData = entries;
  return entries;
}

export function calculateRankings(visaData: VisaEntry[]): PassportRanking[] {
  if (_rankings) return _rankings;

  const countryScores = new Map<string, {
    visaFree: number;
    visaOnArrival: number;
    eta: number;
    eVisa: number;
    visaRequired: number;
    noAdmission: number;
  }>();

  for (const entry of visaData) {
    if (entry.requirement === '-1') continue; // same country

    if (!countryScores.has(entry.passport)) {
      countryScores.set(entry.passport, {
        visaFree: 0, visaOnArrival: 0, eta: 0, eVisa: 0, visaRequired: 0, noAdmission: 0,
      });
    }

    const scores = countryScores.get(entry.passport)!;
    const req = entry.requirement.trim().toLowerCase();

    if (isVisaFreeRequirement(req)) {
      scores.visaFree++;
    } else if (req === 'visa on arrival') {
      scores.visaOnArrival++;
    } else if (req === 'eta') {
      scores.eta++;
    } else if (req === 'e-visa') {
      scores.eVisa++;
    } else if (req === 'no admission') {
      scores.noAdmission++;
    } else {
      scores.visaRequired++;
    }
  }

  const rankings: PassportRanking[] = [];

  for (const [country, scores] of countryScores) {
    const meta = COUNTRIES[country];
    if (!meta) continue;

    rankings.push({
      rank: 0,
      country,
      meta,
      visaFreeCount: scores.visaFree,
      visaOnArrivalCount: scores.visaOnArrival,
      etaCount: scores.eta,
      eVisaCount: scores.eVisa,
      visaRequiredCount: scores.visaRequired,
      noAdmissionCount: scores.noAdmission,
      mobilityScore: scores.visaFree + scores.visaOnArrival + scores.eta,
      slug: slugify(country),
    });
  }

  rankings.sort((a, b) => b.mobilityScore - a.mobilityScore);

  let currentRank = 1;
  for (let i = 0; i < rankings.length; i++) {
    if (i > 0 && rankings[i].mobilityScore < rankings[i - 1].mobilityScore) {
      currentRank = i + 1;
    }
    rankings[i].rank = currentRank;
  }

  _rankings = rankings;
  return rankings;
}

export function calculateWelcomingRanks(visaData: VisaEntry[]) {
  if (_welcomingRanks) return _welcomingRanks;

  const welcomeMap = new Map<string, number>();

  for (const entry of visaData) {
    if (entry.requirement === '-1') continue;
    if (isMobilityPositive(entry.requirement.trim().toLowerCase())) {
      welcomeMap.set(entry.destination, (welcomeMap.get(entry.destination) || 0) + 1);
    }
  }

  const result = Array.from(welcomeMap.entries())
    .map(([country, score]) => ({
      country,
      meta: COUNTRIES[country]!,
      score,
      slug: slugify(country),
    }))
    .filter(r => r.meta)
    .sort((a, b) => b.score - a.score);

  _welcomingRanks = result;
  return result;
}

export function getCountryDetail(visaData: VisaEntry[], country: string): CountryDetail | null {
  const meta = COUNTRIES[country];
  if (!meta) return null;

  const rankings = calculateRankings(visaData);
  const ranking = rankings.find(r => r.country === country);
  if (!ranking) return null;

  const visaFree: string[] = [];
  const visaOnArrival: string[] = [];
  const eta: string[] = [];
  const eVisa: string[] = [];
  const visaRequired: string[] = [];
  const noAdmission: string[] = [];

  let welcomingScore = 0;

  for (const entry of visaData) {
    if (entry.requirement === '-1') continue;

    if (entry.passport === country) {
      const req = entry.requirement.trim().toLowerCase();
      if (isVisaFreeRequirement(req)) visaFree.push(entry.destination);
      else if (req === 'visa on arrival') visaOnArrival.push(entry.destination);
      else if (req === 'eta') eta.push(entry.destination);
      else if (req === 'e-visa') eVisa.push(entry.destination);
      else if (req === 'no admission') noAdmission.push(entry.destination);
      else visaRequired.push(entry.destination);
    }

    if (entry.destination === country && isMobilityPositive(entry.requirement.trim().toLowerCase())) {
      welcomingScore++;
    }
  }

  return {
    country,
    meta,
    ranking,
    visaFree,
    visaOnArrival,
    eta,
    eVisa,
    visaRequired,
    noAdmission,
    welcomingScore,
  };
}

export function comparePassports(visaData: VisaEntry[], countries: string[]): {
  common: { visaFree: string[]; visaOnArrival: string[]; eta: string[] };
  unique: Record<string, { visaFree: string[]; visaOnArrival: string[]; eta: string[] }>;
} {
  const countryAccessMap = new Map<string, Map<string, string>>();

  for (const country of countries) {
    countryAccessMap.set(country, new Map());
  }

  for (const entry of visaData) {
    if (entry.requirement === '-1') continue;
    if (countries.includes(entry.passport)) {
      countryAccessMap.get(entry.passport)!.set(entry.destination, entry.requirement.trim().toLowerCase());
    }
  }

  const allDestinations = new Set<string>();
  for (const map of countryAccessMap.values()) {
    for (const dest of map.keys()) {
      allDestinations.add(dest);
    }
  }

  const commonVisaFree: string[] = [];
  const commonVOA: string[] = [];
  const commonETA: string[] = [];
  const unique: Record<string, { visaFree: string[]; visaOnArrival: string[]; eta: string[] }> = {};

  for (const c of countries) {
    unique[c] = { visaFree: [], visaOnArrival: [], eta: [] };
  }

  for (const dest of allDestinations) {
    const reqs = countries.map(c => countryAccessMap.get(c)!.get(dest) || 'visa required');

    const allFree = reqs.every(r => isVisaFreeRequirement(r));
    const allVOA = reqs.every(r => r === 'visa on arrival');
    const allETA = reqs.every(r => r === 'eta');

    if (allFree) {
      commonVisaFree.push(dest);
    } else if (allVOA) {
      commonVOA.push(dest);
    } else if (allETA) {
      commonETA.push(dest);
    } else {
      for (let i = 0; i < countries.length; i++) {
        const req = reqs[i];
        if (isVisaFreeRequirement(req)) unique[countries[i]].visaFree.push(dest);
        else if (req === 'visa on arrival') unique[countries[i]].visaOnArrival.push(dest);
        else if (req === 'eta') unique[countries[i]].eta.push(dest);
      }
    }
  }

  return {
    common: { visaFree: commonVisaFree, visaOnArrival: commonVOA, eta: commonETA },
    unique,
  };
}

// ─── Detailed comparison (used by compare pages + API) ───────────────
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

export interface DestinationEntry {
  destination: string;
  code: string;
  slug: string;
  bestStatus: string;
  bestPassport: string;
  perPassport: Record<string, string>;
}

export interface DetailedComparison {
  countries: string[];
  rankings: Record<string, PassportRanking>;
  combinedMobilityScore: number;
  combinedRank: number;
  combinedStats: { visaFree: number; voa: number; eta: number; eVisa: number; visaRequired: number; noAdmission: number };
  individualStats: Record<string, { visaFree: number; voa: number; eta: number; eVisa: number; visaRequired: number; noAdmission: number }>;
  gainFromCombining: number;
  maxIndividualScore: number;
  destinationTable: DestinationEntry[];
}

export function getDetailedComparison(visaData: VisaEntry[], countryNames: string[]): DetailedComparison {
  const allRankings = calculateRankings(visaData);

  const rankings: Record<string, PassportRanking> = {};
  for (const name of countryNames) {
    const ranking = allRankings.find(r => r.country === name);
    if (ranking) rankings[name] = ranking;
  }

  const accessMap: Record<string, Record<string, string>> = {};
  for (const name of countryNames) {
    accessMap[name] = {};
  }

  for (const entry of visaData) {
    if (entry.requirement === '-1') continue;
    if (!countryNames.includes(entry.passport)) continue;
    accessMap[entry.passport][entry.destination] = classifyRequirement(entry.requirement);
  }

  const allDestinations = new Set<string>();
  for (const map of Object.values(accessMap)) {
    for (const dest of Object.keys(map)) {
      if (!countryNames.includes(dest)) {
        allDestinations.add(dest);
      }
    }
  }

  const destinationTable: DestinationEntry[] = [];
  const combinedStats = { visaFree: 0, voa: 0, eta: 0, eVisa: 0, visaRequired: 0, noAdmission: 0 };
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

    if (bestStatus === 'visa-free') combinedStats.visaFree++;
    else if (bestStatus === 'voa') combinedStats.voa++;
    else if (bestStatus === 'eta') combinedStats.eta++;
    else if (bestStatus === 'e-visa') combinedStats.eVisa++;
    else if (bestStatus === 'no-admission') combinedStats.noAdmission++;
    else combinedStats.visaRequired++;
  }

  const combinedMobilityScore = combinedStats.visaFree + combinedStats.voa + combinedStats.eta;

  let combinedRank = 1;
  for (const r of allRankings) {
    if (r.mobilityScore > combinedMobilityScore) {
      combinedRank = r.rank + 1;
    } else {
      break;
    }
  }

  const individualScores = countryNames.map(n => rankings[n]?.mobilityScore || 0);
  const maxIndividualScore = Math.max(...individualScores);
  const gainFromCombining = combinedMobilityScore - maxIndividualScore;

  return {
    countries: countryNames,
    rankings,
    combinedMobilityScore,
    combinedRank,
    combinedStats,
    individualStats,
    gainFromCombining,
    maxIndividualScore,
    destinationTable,
  };
}

// DSS (Destination Significance Score) - weighted ranking
export function calculateDSS(rankings: PassportRanking[]): (PassportRanking & { dssScore: number })[] {
  // Weight destinations by their "exclusivity" - countries visited by fewer passports are worth more
  return rankings.map(r => ({
    ...r,
    dssScore: Math.round(r.mobilityScore * 100 + r.visaFreeCount * 50 + r.visaOnArrivalCount * 20 + r.etaCount * 15) / 100,
  })).sort((a, b) => b.dssScore - a.dssScore);
}
