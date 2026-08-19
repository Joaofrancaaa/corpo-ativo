import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { HeroSection } from '@/features/hero';
import TrustStrip from '@/components/TrustStrip/TrustStrip';
import BenefitsSection from '@/components/Benefits/BenefitsSection';
import PricingSection from '@/components/Pricing/PricingSection';
import ModalitiesSection from '@/components/Modalities/ModalitiesSection';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <TrustStrip />
        <BenefitsSection />
        <ModalitiesSection />
        <PricingSection />
      </main>
      <Footer />
    </>
  );
}
