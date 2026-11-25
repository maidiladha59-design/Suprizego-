import { AnnouncementBar } from "@/components/landing/announcement-bar";
import { Hero } from "@/components/landing/hero";
import { MarqueeBand } from "@/components/landing/marquee-band";
import { MomentsSection } from "@/components/landing/moments-section";
import { SpecialDaysSection } from "@/components/landing/special-days-section";
import { StepsSection } from "@/components/landing/steps-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaBand } from "@/components/landing/cta-band";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AnnouncementBar />
        <Hero />
        <MarqueeBand />
        <MomentsSection />
        <SpecialDaysSection />
        <StepsSection />
        <FeaturesSection />
        <PricingSection />
        <FaqSection />
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}
