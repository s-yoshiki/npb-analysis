import type { Metadata } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/theme-script";

export const metadata: Metadata = {
  title: {
    default: "NPB Analysis",
    template: "%s | NPB Analysis",
  },
  description:
    "NPB公式記録をもとに、選手プロフィールと打撃・投手成績を検索・集計・可視化するデータアーカイブです。",
  applicationName: "NPB Analysis",
  formatDetection: { address: false, email: false, telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The pre-paint script mutates <html>, which the server cannot predict.
    <html lang="ja" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
