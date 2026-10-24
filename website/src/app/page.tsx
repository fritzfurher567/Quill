import { AboutSection } from "@/components/about-section";
import { DownloadSection } from "@/components/download-section";
import { FeatureSection } from "@/components/feature-section";
import { Footer } from "@/components/footer";
import { GettingStarted } from "@/components/getting-started";
import { Hero } from "@/components/hero";
import { ProductPreview } from "@/components/product-preview";
import { SystemRequirements } from "@/components/system-requirements";
import { loadLatestRelease } from "@/lib/release";

/**
 * The page is statically generated and regenerated at most every 15 minutes,
 * which refreshes the release data and the copyright year together. (This must
 * be a literal for Next.js; it matches RELEASE_REVALIDATE_SECONDS.)
 */
export const revalidate = 900;

export default async function Home() {
  const release = await loadLatestRelease();

  return (
    <>
      <main id="main">
        <Hero />
        <DownloadSection initial={release} />
        <FeatureSection />
        <ProductPreview />
        <GettingStarted />
        <AboutSection />
        <SystemRequirements />
      </main>
      <Footer />
    </>
  );
}
