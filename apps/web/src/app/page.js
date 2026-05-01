import { CTASection, Footer } from "@/components/common/footer";
import Navbar from "@/components/common/navbar";
import FeaturesSection from "@/components/pages/home/FeaturesSection";
import HeroSection from "@/components/pages/home/HeroSection";
import HowItWorksSection from "@/components/pages/home/HowItWorksSection";
import PricingSection from "@/components/pages/home/PricingSection";
import TestimonialsSection from "@/components/pages/home/TestimonialsSection";

export const metadata = {
  title: "Collaborative Team Hub — Where great teams do great work",
  description:
    "Goals, tasks, announcements, and analytics — all in one beautiful workspace. Built for teams who move fast.",
};

export default function LandingPage() {
  return (
    <main className="bg-[#0d0c0b]">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
