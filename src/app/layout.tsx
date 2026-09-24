import type { Metadata, Viewport } from "next";
import "./globals.css";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import ThemeProvider from "@/theme/ThemeProvider";
import { neutral } from "@/theme/tokens";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter, Poppins, Roboto_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-poppins", display: "swap" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-roboto-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Finloom | Learn. Practise. Build your process.",
  description: "Market learning and simulated trading practice for aspiring trading professionals.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: neutral.light.bg },
    { media: "(prefers-color-scheme: dark)", color: neutral.dark.bg },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable} ${robotoMono.variable}`}>
      <body>
        <InitColorSchemeScript attribute="data-color-scheme" defaultMode="system" />
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
