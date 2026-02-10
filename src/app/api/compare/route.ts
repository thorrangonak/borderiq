import { NextRequest, NextResponse } from 'next/server';
import { getComparison, getRankings } from '@/lib/load-data';
import { COUNTRIES } from '@/lib/countries';

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
    return NextResponse.json(
      { error: 'At least 2 countries are required for comparison.' },
      { status: 400 }
    );
  }

  if (countryNames.length > 4) {
    return NextResponse.json(
      { error: 'Maximum 4 countries can be compared at once.' },
      { status: 400 }
    );
  }

  // Validate that all country names exist
  const invalidCountries = countryNames.filter(name => !COUNTRIES[name]);
  if (invalidCountries.length > 0) {
    return NextResponse.json(
      { error: `Unknown countries: ${invalidCountries.join(', ')}` },
      { status: 400 }
    );
  }

  const comparison = getComparison(countryNames);
  const allRankings = getRankings();

  // Get ranking data for each selected country
  const rankings: Record<string, typeof allRankings[number]> = {};
  for (const name of countryNames) {
    const ranking = allRankings.find(r => r.country === name);
    if (ranking) {
      rankings[name] = ranking;
    }
  }

  // Calculate combined mobility score (union of all accessible destinations)
  const combinedDestinations = new Set<string>();
  // Common access
  for (const dest of comparison.common.visaFree) combinedDestinations.add(dest);
  for (const dest of comparison.common.visaOnArrival) combinedDestinations.add(dest);
  for (const dest of comparison.common.eta) combinedDestinations.add(dest);
  // Unique access from each passport
  for (const country of countryNames) {
    const unique = comparison.unique[country];
    if (unique) {
      for (const dest of unique.visaFree) combinedDestinations.add(dest);
      for (const dest of unique.visaOnArrival) combinedDestinations.add(dest);
      for (const dest of unique.eta) combinedDestinations.add(dest);
    }
  }

  return NextResponse.json({
    countries: countryNames,
    rankings,
    comparison,
    combinedMobilityScore: combinedDestinations.size,
  });
}
