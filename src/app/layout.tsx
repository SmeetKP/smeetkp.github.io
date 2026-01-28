import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@fontsource/press-start-2p"; // Retro Font
import "./globals.css";

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
  title: "Smeet Kumar Patel | Data Analytics Manager & AI Solutions Architect",
  description: "14+ years transforming data into strategic business outcomes. Data Analytics Manager & AI Solutions Architect at Sonova Group. Expert in Power BI, Python, Azure, and Gen AI adoption.",
  keywords: ["Data Analytics", "AI Solutions Architect", "Power BI", "Python", "Machine Learning", "Azure", "Gen AI", "Berlin", "Data Transformation", "Business Intelligence"],
  authors: [{ name: "Smeet Kumar Patel" }],
  creator: "Smeet Kumar Patel",
  metadataBase: new URL("https://smeetkumarpatel.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://smeetkumarpatel.com",
    siteName: "Smeet Kumar Patel Portfolio",
    title: "Smeet Kumar Patel | Data Analytics Manager & AI Solutions Architect",
    description: "14+ years transforming data into strategic business outcomes. Leading global BI transformation across 11 countries. Expert in Gen AI adoption with 70% faster development cycles.",
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
    title: "Smeet Kumar Patel | Data Analytics Manager & AI Solutions Architect",
    description: "14+ years transforming data into strategic business outcomes. Expert in Power BI, Python, Azure, and Gen AI.",
    images: ["/og-image.png"],
    creator: "@smeetkumarpatel",
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
  verification: {
    google: "your-google-verification-code",
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
        <link rel="preconnect" href="https://assets.aceternity.com" />
        <link rel="dns-prefetch" href="https://assets.aceternity.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
