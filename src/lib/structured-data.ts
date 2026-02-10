const BASE_URL = 'https://borderiq.io';

export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BorderIQ',
    alternateName: 'BorderIQ.io',
    url: BASE_URL,
    description: 'Global Passport Intelligence - Explore passport rankings, visa-free travel data, and comprehensive visa requirements for 199 countries.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/countries?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BorderIQ',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
  };
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BorderIQ',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: [
      'https://github.com/thorrangonak/borderiq',
    ],
    description: 'Global Passport Intelligence Platform - Passport rankings, visa requirements, and travel data for 199 countries.',
  };
}

export function getRankingsTableSchema(rankings: { country: string; rank: number; mobilityScore: number }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Table',
    name: 'Passport Power Rankings 2026',
    description: 'Global passport power rankings based on visa-free mobility score for 199 countries.',
    about: {
      '@type': 'Thing',
      name: 'Passport Power Index',
      description: 'Rankings of world passports by visa-free travel access',
    },
  };
}

export function getCountrySchema(country: {
  name: string;
  code: string;
  region: string;
  rank: number;
  mobilityScore: number;
  visaFreeCount: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Country',
    name: country.name,
    url: `${BASE_URL}/country/${country.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
    identifier: country.code,
    containedInPlace: {
      '@type': 'Place',
      name: country.region,
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Passport Power Rank',
        value: country.rank,
      },
      {
        '@type': 'PropertyValue',
        name: 'Mobility Score',
        value: country.mobilityScore,
      },
      {
        '@type': 'PropertyValue',
        name: 'Visa-Free Destinations',
        value: country.visaFreeCount,
      },
    ],
  };
}

export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getCompareToolSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'BorderIQ Passport Comparison Tool',
    url: `${BASE_URL}/compare`,
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Web',
    description: 'Compare passports side by side. See shared visa-free destinations, unique access advantages, and combined mobility scores.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}
