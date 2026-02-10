import { COUNTRIES } from '@/lib/countries';
import CompareClient from './CompareClient';

export const metadata = {
  title: 'Compare Passports - BorderIQ',
  description: 'Select two or more passports to compare their visa-free access side by side. Discover common destinations, unique advantages, and combined mobility scores.',
};

export default function ComparePage() {
  const countries = Object.values(COUNTRIES).map(c => ({
    name: c.name,
    code: c.code,
  }));

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-navy-800" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[450px] lg:w-[600px] h-[200px] sm:h-[300px] lg:h-[400px] bg-teal-500/8 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-20 pb-8 sm:pb-12 text-center">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-white via-teal-200 to-teal-400 bg-clip-text text-transparent">
              Compare Passports
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-foreground-muted max-w-2xl mx-auto">
            Select two or more passports to compare their visa-free access side by side
          </p>
        </div>
      </section>

      {/* Comparison tool */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <CompareClient countries={countries} />
      </section>
    </div>
  );
}
