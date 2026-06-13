import appsData from "@/data/apps.json";
import metaData from "@/data/meta.json";
import type { App, Meta } from "@/lib/types";
import { SITE } from "@/lib/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Directory } from "@/components/Directory";
import { BuildStudio } from "@/components/BuildStudio";
import { FloatingBuildBar } from "@/components/FloatingBuildBar";
import { SelectionProvider } from "@/components/SelectionContext";

const apps = appsData as unknown as App[];
const meta = metaData as Meta;

async function getStarCount(): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${SITE.githubRepo}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.stargazers_count ?? null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const stars = await getStarCount();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CanIHost",
    url: SITE.url,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    description:
      "Search self-hosted apps, estimate your homelab's RAM/CPU footprint, and generate a starter docker-compose.yml.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    creator: { "@type": "Person", name: "Nate Watkins", url: SITE.n8builds },
    isBasedOn: SITE.awesome,
  };

  return (
    <SelectionProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header stars={stars} />
      <main>
        <Hero meta={meta} />
        <BuildStudio apps={apps} />
        <Directory apps={apps} meta={meta} />
      </main>
      <Footer />
      <FloatingBuildBar apps={apps} />
    </SelectionProvider>
  );
}
