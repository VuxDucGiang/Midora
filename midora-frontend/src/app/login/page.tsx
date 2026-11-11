import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoginView from "@/features/auth/components/LoginView";
import NavbarAuthControls from "@/features/auth/components/NavbarAuthControls";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar
        authSlot={<NavbarAuthControls />}
        mobileAuthSlot={<NavbarAuthControls mobile />}
      />

      <main className="relative flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="absolute inset-0 vintage-stitch opacity-30 pointer-events-none" />
        <div className="relative w-full">
          <LoginView />
        </div>
      </main>

      <Footer />
    </div>
  );
}

