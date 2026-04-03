import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import CommandPalette from "@/components/CommandPalette";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "pkgdocs" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "pkgdocs — Visual Package Documentation",
    description: "Interactive stories, API graphs, and copy-paste recipes for Python and npm packages.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}
