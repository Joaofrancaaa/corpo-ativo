import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { HeroSection } from '@/features/hero';
import PricingSection from '@/components/Pricing/PricingSection';
import ModalitiesSection from '@/components/Modalities/ModalitiesSection';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ModalitiesSection />
        <PricingSection />
      </main>
      <Footer />
    </>
  );
}
