import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getWebsiteSchema, getOrganizationSchema } from "@/lib/structured-data";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = "https://borderiq.io";

export const viewport: Viewport = {
  themeColor: "#0a0f1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "BorderIQ - Global Passport Intelligence | Passport Rankings & Visa Data",
    template: "%s | BorderIQ",
  },
  description:
    "Explore global passport rankings, visa-free travel scores, and comprehensive visa requirement data for 199 countries. Compare passports, discover travel freedom, and plan your journey with real-time intelligence.",
  keywords: [
    "passport index",
    "passport ranking",
    "passport power",
    "visa-free travel",
    "visa requirements",
    "travel freedom",
    "global mobility",
    "passport comparison",
    "visa-free countries",
    "strongest passport",
    "passport score",
    "travel visa",
    "world passport ranking 2026",
    "best passports",
    "borderiq",
  ],
  authors: [{ name: "BorderIQ", url: BASE_URL }],
  creator: "BorderIQ",
  publisher: "BorderIQ",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "BorderIQ",
    title: "BorderIQ - Global Passport Intelligence",
    description:
      "Explore passport rankings, visa-free travel data, and visa requirements for 199 countries. Compare passports and discover your travel freedom.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BorderIQ - Global Passport Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BorderIQ - Global Passport Intelligence",
    description:
      "Explore passport rankings, visa-free travel data, and visa requirements for 199 countries.",
    images: ["/og-image.png"],
    creator: "@borderiq",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: "travel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getWebsiteSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationSchema()),
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
