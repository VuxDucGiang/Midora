import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import ProposalSection from "@/components/home/ProposalSection";
import InteractiveDemoSection from "@/components/home/InteractiveDemoSection";
import ContestRoadmapSection from "@/components/home/ContestRoadmapSection";
import TeamSection from "@/components/home/TeamSection";
import ContactSection from "@/components/home/ContactSection";
import NavbarAuthControls from "@/features/auth/components/NavbarAuthControls";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] selection:bg-[#191817] selection:text-[#FAF7F2]">
      <Navbar
        authSlot={<NavbarAuthControls />}
        mobileAuthSlot={<NavbarAuthControls mobile />}
      />

      <main className="flex-1">
        <Hero />
        <ProposalSection />
        <InteractiveDemoSection />
        <ContestRoadmapSection />
        <TeamSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
