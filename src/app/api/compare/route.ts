import { NextRequest, NextResponse } from 'next/server';
import { getDetailedComparisonData } from '@/lib/load-data';
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

  const result = getDetailedComparisonData(countryNames);
  return NextResponse.json(result);
}
