import type { Metadata } from "next";
import { getAdvisorFAQs } from "@/lib/seo-data";
import { getFAQSchema, getBreadcrumbSchema } from "@/lib/structured-data";
import AdvisorClient from "./AdvisorClient";

export const metadata: Metadata = {
  title: "AI Visa Checker - Do I Need a Visa? | BorderIQ",
  description: "Check visa requirements instantly for any passport and destination. AI-powered visa checker covers 199 passports and 39,000+ visa policies. Find out if you need a visa, ETIAS, ETA, or can travel visa-free.",
  alternates: { canonical: "https://borderiq.io/advisor" },
  keywords: [
    "AI visa checker",
    "do I need a visa",
    "visa requirements checker",
    "ETIAS requirements 2026",
    "visa-free travel checker",
  ],
  openGraph: {
    title: "AI Visa Checker - Do I Need a Visa? | BorderIQ",
    description: "Check visa requirements instantly with AI-powered guidance for 199 passports.",
    url: "https://borderiq.io/advisor",
  },
};

export default function AdvisorPage() {
  const faqs = getAdvisorFAQs();

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getFAQSchema(faqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBreadcrumbSchema([
            { name: 'Home', url: 'https://borderiq.io' },
            { name: 'AI Visa Checker', url: 'https://borderiq.io/advisor' },
          ])),
        }}
      />

      <AdvisorClient />

      {/* SEO Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Popular Visa Questions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white mb-1">Do US citizens need a visa for Europe?</h3>
              <p className="text-gray-400 text-xs leading-relaxed">US passport holders can visit the Schengen Area visa-free for up to 90 days. Starting in 2026, ETIAS authorization will also be required.</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white mb-1">Do Indian citizens need a visa for the US?</h3>
              <p className="text-gray-400 text-xs leading-relaxed">Yes, Indian passport holders need a B1/B2 visa to visit the United States. Apply through the US Embassy or Consulate in India.</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white mb-1">What is ETIAS?</h3>
              <p className="text-gray-400 text-xs leading-relaxed">ETIAS (European Travel Information and Authorisation System) is a new pre-travel authorization for visa-exempt travelers to the Schengen Area, launching in 2026.</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white mb-1">Do UK citizens need a visa for the US?</h3>
              <p className="text-gray-400 text-xs leading-relaxed">UK passport holders can travel to the US under the Visa Waiver Program with an approved ESTA (Electronic System for Travel Authorization).</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="rounded-xl bg-white/5 border border-white/10 p-5">
            {faqs.map((faq, i) => (
              <details key={i} className="group mb-3 last:mb-0">
                <summary className="cursor-pointer text-gray-300 hover:text-white font-medium py-2 px-3 rounded-lg hover:bg-white/5 transition-colors list-none flex items-center justify-between">
                  {faq.question}
                  <span className="text-gray-500 group-open:rotate-90 transition-transform">&rsaquo;</span>
                </summary>
                <p className="text-gray-400 text-sm leading-relaxed px-3 pb-2 pt-1">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
