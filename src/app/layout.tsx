import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/theme/ThemeProvider";
import { Inter, Poppins, Roboto_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-inter" });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-poppins" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-roboto-mono" });

export const metadata: Metadata = {
  title: "Finloom - Modern Fintech Platform",
  description: "A prop trade firm with advanced analytics and trading tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} ${robotoMono.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
