import { NextRequest, NextResponse } from 'next/server';
import { getVisaData } from '@/lib/load-data';
import { COUNTRIES } from '@/lib/countries';

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get('country');

  if (!country || !COUNTRIES[country]) {
    return NextResponse.json({ error: 'Invalid country' }, { status: 400 });
  }

  const visaData = getVisaData();
  const result: Record<string, { requirement: string; code: string }> = {};

  for (const entry of visaData) {
    if (entry.passport !== country) continue;
    if (entry.requirement === '-1') continue;

    const destMeta = COUNTRIES[entry.destination];
    if (!destMeta) continue;

    const req = entry.requirement.trim().toLowerCase();
    let category: string;
    const num = parseInt(req);

    if (req === 'visa free' || (!isNaN(num) && num > 0)) {
      category = 'visa-free';
    } else if (req === 'visa on arrival') {
      category = 'voa';
    } else if (req === 'eta') {
      category = 'eta';
    } else if (req === 'e-visa') {
      category = 'e-visa';
    } else if (req === 'no admission') {
      category = 'no-admission';
    } else {
      category = 'visa-required';
    }

    result[destMeta.code3] = {
      requirement: category,
      code: destMeta.code,
    };
  }

  // Add the selected country itself
  const selfMeta = COUNTRIES[country];
  if (selfMeta) {
    result[selfMeta.code3] = { requirement: 'home', code: selfMeta.code };
  }

  return NextResponse.json(result);
}
