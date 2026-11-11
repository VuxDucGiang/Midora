import type { Metadata } from "next";
import React from "react";
import Navbar from "@/components/layout/Navbar";
import NavbarAuthControls from "@/features/auth/components/NavbarAuthControls";
import AvatarWorkspace from "@/features/avatar/components/AvatarWorkspace";

export const metadata: Metadata = {
  title: "Tạo Avatar 3D & Hồ sơ số đo | MIDORA",
  description:
    "Khởi tạo Avatar 3D cá nhân hóa theo chiều cao, cân nặng và số đo từng centimet để thử đồ vintage MIDORA.",
};

export default function AvatarPage() {
  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#F4EFEA] selection:bg-[#191817] selection:text-[#FAF7F2]">
      <Navbar
        overlay
        authSlot={<NavbarAuthControls />}
        mobileAuthSlot={<NavbarAuthControls mobile />}
      />

      <main className="h-full w-full">
        <AvatarWorkspace />
      </main>
    </div>
  );
}
