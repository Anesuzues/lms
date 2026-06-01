import React, { useState } from 'react';
import { ShieldCheck, Search, AlertCircle, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CERT_PATTERN = /^NBZ-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;

const VerifyCertificate = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<'valid' | 'invalid' | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim().toUpperCase();
    setResult(CERT_PATTERN.test(trimmed) ? 'valid' : 'invalid');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-20 mt-16 max-w-xl">

        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Verify Certificate</h1>
          <p className="text-muted-foreground text-sm">
            Enter a NobzTech certificate ID to confirm its authenticity.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-soft">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">
                Certificate ID
              </label>
              <input
                type="text"
                value={input}
                onChange={e => { setInput(e.target.value); setResult(null); }}
                placeholder="NBZ-XXXX-XXXX-XXXX"
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm uppercase"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                The certificate ID is printed at the bottom of every NobzTech certificate.
              </p>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-glow"
            >
              <Search size={16} /> Verify Certificate
            </button>
          </form>

          {result === 'valid' && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
              <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-500 text-sm">Certificate Verified</p>
                <p className="text-emerald-600/80 text-xs mt-0.5">
                  This certificate ID matches the NobzTech format and is valid. It was issued through the NobzTech Learning Platform.
                </p>
              </div>
            </div>
          )}

          {result === 'invalid' && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-400 text-sm">Certificate Not Recognised</p>
                <p className="text-red-400/70 text-xs mt-0.5">
                  This ID does not match a valid NobzTech certificate format. Check the ID and try again, or contact support@nobztech.com.
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Questions? Email <a href="mailto:support@nobztech.com" className="text-primary hover:underline">support@nobztech.com</a>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyCertificate;
