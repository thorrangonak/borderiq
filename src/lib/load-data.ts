import fs from 'fs';
import path from 'path';
import { parseVisaData, calculateRankings, calculateWelcomingRanks, getCountryDetail, comparePassports, getDetailedComparison, type VisaEntry } from './data';

let _csvText: string | null = null;
let _visaData: VisaEntry[] | null = null;

function loadCSV(): string {
  if (_csvText) return _csvText;
  _csvText = fs.readFileSync(path.join(process.cwd(), 'src/data/passport-index-tidy.csv'), 'utf-8');
  return _csvText;
}

export function getVisaData(): VisaEntry[] {
  if (_visaData) return _visaData;
  _visaData = parseVisaData(loadCSV());
  return _visaData;
}

export function getRankings() {
  return calculateRankings(getVisaData());
}

export function getWelcomingRanks() {
  return calculateWelcomingRanks(getVisaData());
}

export function getCountryDetails(country: string) {
  return getCountryDetail(getVisaData(), country);
}

export function getComparison(countries: string[]) {
  return comparePassports(getVisaData(), countries);
}

export function getDetailedComparisonData(countries: string[]) {
  return getDetailedComparison(getVisaData(), countries);
}
