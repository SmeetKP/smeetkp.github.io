import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@fontsource/press-start-2p";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Smeet Kumar Patel | Manager, Data Engineering, Analytics & GenAI",
  description: "Leading enterprise analytics + GenAI delivery across 20 countries at Sonova Group. 175 users supported, 21 dashboards, 53% daily active usage. Expert in Power BI, Python, Azure, and GenAI.",
  keywords: ["Data Engineering", "Analytics", "GenAI", "Power BI", "Python", "Machine Learning", "Azure", "Berlin", "Data Governance", "Business Intelligence"],
  authors: [{ name: "Smeet Kumar Patel" }],
  creator: "Smeet Kumar Patel",
  metadataBase: new URL("https://smeetkp.github.io"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://smeetkp.github.io",
    siteName: "Smeet Kumar Patel Portfolio",
    title: "Smeet Kumar Patel | Manager, Data Engineering, Analytics & GenAI",
    description: "Leading enterprise analytics + GenAI delivery across 20 countries. 175 users supported, 21 dashboards, 53% daily active usage at Sonova Group.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Smeet Kumar Patel - Data Analytics Manager & AI Solutions Architect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smeet Kumar Patel | Manager, Data Engineering, Analytics & GenAI",
    description: "Leading enterprise analytics + GenAI across 20 countries. 175 users, 21 dashboards, 53% daily active at Sonova Group.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
