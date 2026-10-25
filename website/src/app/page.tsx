import { AboutSection } from "@/components/about-section";
import { DownloadCta } from "@/components/download-cta";
import { FeatureSection } from "@/components/feature-section";
import { Footer } from "@/components/footer";
import { GettingStarted } from "@/components/getting-started";
import { Hero } from "@/components/hero";
import { ProductPreview } from "@/components/product-preview";
import { SystemRequirements } from "@/components/system-requirements";
import { loadDownloads } from "@/lib/downloads/load";


export default async function Home() {
  const downloads = await loadDownloads();

  return (
    <>
      <main id="main">
        <Hero />
        <FeatureSection />
        <ProductPreview />
        <GettingStarted />
        <AboutSection />
        <SystemRequirements />
        <DownloadCta result={downloads} />
      </main>
      <Footer />
    </>
  );
}
