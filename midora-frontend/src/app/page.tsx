import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import ProposalSection from "@/components/home/ProposalSection";
import InteractiveDemoSection from "@/components/home/InteractiveDemoSection";
import ContestRoadmapSection from "@/components/home/ContestRoadmapSection";
import TeamSection from "@/components/home/TeamSection";
import MediaPitchSection from "@/components/home/MediaPitchSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] selection:bg-[#111111] selection:text-[#ffffff]">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Band with Try-On Product UI Fragment */}
        <Hero />

        {/* 2. Proposal Summary & Pain Points */}
        <ProposalSection />

        {/* 3. Interactive 3D Try-On Studio & Sizing Engine */}
        <InteractiveDemoSection />

        {/* 4. Competition Roadmap & Milestones */}
        <ContestRoadmapSection />

        {/* 5. Team Members (Requirement for Contest Submission) */}
        <TeamSection />

        {/* 6. Media Pitch & Pitch Deck Showcase */}
        <MediaPitchSection />
      </main>

      {/* Surface Dark Footer (#101010) */}
      <Footer />
    </div>
  );
}
