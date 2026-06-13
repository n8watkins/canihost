import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default:
      "CanIHost — search self-hosted apps & generate docker-compose files",
    template: "%s · CanIHost",
  },
  description:
    "A real, searchable frontend for the awesome-selfhosted list. Browse 1,300+ self-hosted apps, check maintenance signals, estimate your homelab's RAM/CPU with the \"Can I run this?\" calculator, and auto-generate a starter docker-compose.yml.",
  keywords: [
    "self-hosted apps",
    "selfhosted alternatives",
    "docker-compose generator",
    "homelab apps",
    "can I self-host",
    "awesome-selfhosted",
    "self hosting",
    "homelab resource calculator",
  ],
  authors: [{ name: "Nate Watkins", url: SITE.n8builds }],
  creator: "Nate Watkins",
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: "CanIHost",
    title:
      "CanIHost — search self-hosted apps & generate docker-compose files",
    description:
      "Browse 1,300+ self-hosted apps, check maintenance signals, estimate your homelab footprint, and generate a starter docker-compose.yml.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CanIHost — search self-hosted apps & generate compose files",
    description:
      "A searchable frontend for awesome-selfhosted with a resource calculator and docker-compose generator.",
    creator: "@n8watkins",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${mono.variable} font-sans bg-bg text-ink antialiased`}
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
