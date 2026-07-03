import Hero from "@/components/hero";
import FeaturedCars from "@/components/featurecar";
import ProcedureSection from "@/components/procedure-section";
import AboutUsSection from "@/components/about-us-section";
import ContactSection from "@/components/contact-section";

export default function Home() {
  return (
    <main>
      <Hero />
      <AboutUsSection />
      <FeaturedCars />
      <ProcedureSection />
      <ContactSection />
    </main>
  );
}
