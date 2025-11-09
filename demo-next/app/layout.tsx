import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactSourceLensProvider } from '@/components/ReactSourceLensProvider';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "React Source Lens Demo - Next.js",
  description: "Demo of React Source Lens with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactSourceLensProvider />
        {children}
      </body>
    </html>
  );
}
