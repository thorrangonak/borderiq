import type { Metadata } from "next";
import AdvisorClient from "./AdvisorClient";

export const metadata: Metadata = {
  title: "AI Travel Advisor - Personalized Visa & Travel Guidance",
  description: "Get personalized travel advice based on your passport. Discover visa-free destinations, travel tips, and mobility insights with AI-powered guidance.",
  alternates: { canonical: "https://borderiq.io/advisor" },
  openGraph: {
    title: "AI Travel Advisor - BorderIQ",
    description: "Personalized travel and visa guidance powered by AI intelligence.",
    url: "https://borderiq.io/advisor",
  },
};

export default function AdvisorPage() {
  return <AdvisorClient />;
}
