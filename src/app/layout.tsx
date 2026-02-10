import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BorderIQ - Global Passport Intelligence",
  description:
    "Explore global passport rankings, visa-free travel scores, and comprehensive visa requirement data for every country. Compare passports, discover travel freedom, and plan your journey with real-time intelligence.",
  keywords: [
    "passport index",
    "passport ranking",
    "visa-free travel",
    "visa requirements",
    "travel freedom",
    "passport power",
    "global mobility",
  ],
  openGraph: {
    title: "BorderIQ - Global Passport Intelligence",
    description:
      "Explore global passport rankings, visa-free travel scores, and comprehensive visa requirement data for every country.",
    siteName: "BorderIQ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
