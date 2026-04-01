import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://pkgdocs-swart.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "pkgdocs — Visual Package Documentation",
    template: "%s · pkgdocs",
  },
  description:
    "Interactive stories, API graphs, live demos, and copy-paste recipes for Python and npm packages. Understand any library at your level.",
  keywords: ["package documentation", "npm", "pypi", "python", "javascript", "api reference", "tutorials"],
  authors: [{ name: "pkgdocs" }],
  openGraph: {
    type: "website",
    siteName: "pkgdocs",
    title: "pkgdocs — Visual Package Documentation",
    description:
      "Interactive stories, API graphs, live demos, and copy-paste recipes for Python and npm packages.",
    url: BASE_URL,
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "pkgdocs" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "pkgdocs — Visual Package Documentation",
    description: "Interactive stories, API graphs, and copy-paste recipes for Python and npm packages.",
    images: ["/og-default.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
