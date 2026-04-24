import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Cormorant_Garamond,
  Unbounded,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://gems-check.lol");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "GEM Unemployment checker — AlphaGEMs stats",
  description:
    "GEM Unemployment checker. See your AlphaGEMs Discord rank. Are you a gem, or just a cave dweller?",
  openGraph: {
    title: "GEM Unemployment checker — are you a gem?",
    description: "Check your AlphaGEMs Discord stats and share your card.",
    type: "website",
  },
};

const CAVE_CHARACTERS = [
  { src: "/characters/char-1.png", className: "left-2 top-4 sm:top-8 w-40 sm:w-60 md:w-80" },
  { src: "/characters/char-2.png", className: "right-2 top-4 sm:top-8 w-40 sm:w-60 md:w-80" },
  { src: "/characters/char-3.png", className: "left-2 bottom-4 sm:bottom-8 w-40 sm:w-60 md:w-80" },
  { src: "/characters/char-4.png", className: "right-2 bottom-4 sm:bottom-8 w-40 sm:w-60 md:w-80" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans cave-bg">
        <div className="cave-photo" aria-hidden="true" />
        <div className="starfield" aria-hidden="true" />
        <div className="cave-characters pointer-events-none" aria-hidden="true">
          {CAVE_CHARACTERS.map((c) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={c.src}
              src={c.src}
              alt=""
              className={`cave-char pointer-events-none select-none ${c.className}`}
              draggable={false}
            />
          ))}
        </div>
        <div className="relative z-10 flex flex-col flex-1">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
