import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Modules from "@/components/Modules";
import Benefits from "@/components/Benefits";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import IntakeFormModal from "@/components/IntakeFormModal";
import { useState } from "react";

const Index = () => {
  // Google Form URL for intake - USING THE WORKING EDITABLE FORM
  const intakeFormUrl = "https://docs.google.com/forms/d/17f_dVJEPQweDEuNl4QPf0v7I2sa7uRAZKuyH1w_UaYY/viewform";
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      <Header 
        intakeFormUrl={intakeFormUrl} 
        onOpenForm={() => setIsFormModalOpen(true)}
      />
      
      <main>
        <Hero 
          intakeFormUrl={intakeFormUrl} 
          onOpenForm={() => setIsFormModalOpen(true)}
        />
        <Modules />
        <section id="benefits">
          <Benefits />
        </section>
        <section id="contact">
          <CTA 
            intakeFormUrl={intakeFormUrl} 
            onOpenForm={() => setIsFormModalOpen(true)}
          />
        </section>
      </main>
      <Footer />
      
      <IntakeFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
      />
    </div>
  );
};

export default Index;
