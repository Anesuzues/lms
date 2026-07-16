import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Privacy = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="flex-1 container mx-auto px-4 py-20 mt-16 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: June 2026</p>

      <div className="prose prose-sm dark:prose-invert max-w-none text-foreground space-y-6">
        <section>
          <h2 className="text-lg font-bold mb-2">1. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">We collect your name, email address, and learning progress data when you register and use the platform. We also collect usage data to improve the learning experience.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">2. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed">Your information is used to operate the platform, track your learning progress, issue certificates, and communicate with you about your account and courses.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">3. Data Storage</h2>
          <p className="text-muted-foreground leading-relaxed">Your data is stored securely using Supabase infrastructure. We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">4. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">We use essential cookies to maintain your authentication session. No third-party tracking cookies are used.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">5. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">You have the right to access, correct, or delete your personal data at any time. Contact us at <a href="mailto:support@nobztech.com" className="text-primary hover:underline">support@nobztech.com</a> to exercise these rights.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">6. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">For privacy-related questions, email <a href="mailto:support@nobztech.com" className="text-primary hover:underline">support@nobztech.com</a>.</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default Privacy;
