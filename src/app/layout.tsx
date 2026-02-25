import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/nav/navbar";
import SoundEffect from "@/components/ui/sound-effect";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: "SSH - Developer Handbook + Stack Radar",
  description: "Your personal developer handbook and stack radar for building blocks, tech cards, and contribution opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pressStart2P.variable} ${vt323.variable} font-sans bg-[#0D0F1E] crt text-green-400`}
      >
        <AuthProvider>
          <Navbar />
          <main className="pt-24 min-h-screen">{children}</main>
        </AuthProvider>
        <SoundEffect />
      </body>
    </html>
  );
}
