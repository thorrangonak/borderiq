import AdvisorClient from "./AdvisorClient";

export const metadata = {
  title: "AI Travel Advisor - BorderIQ",
  description:
    "Get personalized travel advice based on your passport. Discover visa-free destinations, travel tips, and mobility insights powered by BorderIQ intelligence.",
};

export default function AdvisorPage() {
  return <AdvisorClient />;
}
