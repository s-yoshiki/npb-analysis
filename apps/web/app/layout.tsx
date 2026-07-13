import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Geist, Noto_Serif_JP } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const notoSerif = Noto_Serif_JP({subsets:['latin'],variable:'--font-heading',weight:['700','900']});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "NPB Analysis",
  description: "NPB player database viewer and visualization dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={cn("font-sans", geist.variable, notoSerif.variable)}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
