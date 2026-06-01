import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Terms = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="flex-1 container mx-auto px-4 py-20 mt-16 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: June 2026</p>

      <div className="prose prose-sm max-w-none text-foreground space-y-6">
        <section>
          <h2 className="text-lg font-bold mb-2">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">By accessing or using the NobzTech Learning Platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">2. Use of the Platform</h2>
          <p className="text-muted-foreground leading-relaxed">You agree to use the platform only for lawful purposes and in accordance with these Terms. You may not use the platform to distribute harmful, offensive, or unlawful content.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">3. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">All course content, materials, and platform design are the intellectual property of NobzTech. You may not reproduce, distribute, or create derivative works without express written permission.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">4. Certificates</h2>
          <p className="text-muted-foreground leading-relaxed">Certificates are awarded upon successful completion of course requirements including all module quizzes. NobzTech reserves the right to revoke certificates issued in error or obtained fraudulently.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">5. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">NobzTech provides the platform on an "as is" basis. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">6. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">For questions about these Terms, contact us at <a href="mailto:support@nobztech.com" className="text-primary hover:underline">support@nobztech.com</a>.</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
