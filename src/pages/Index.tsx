import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Modules from "@/components/Modules";
import Benefits from "@/components/Benefits";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Modules />
        <section id="benefits">
          <Benefits />
        </section>
        <section id="contact">
          <CTA />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
