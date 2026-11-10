import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MIDORA – See It. Try It. Love It. | Nền tảng thử đồ ảo thời trang Vintage",
  description: "MIDORA - Nền tảng thử đồ ảo cá nhân hóa dành riêng cho thị trường thời trang secondhand và vintage với avatar 3D theo số đo cơ thể thực tế.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#ffffff] text-[#374151]">
        {children}
      </body>
    </html>
  );
}
