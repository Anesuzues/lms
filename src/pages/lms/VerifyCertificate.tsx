import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, Search, AlertCircle, CheckCircle, Trophy, Loader2, Calendar, User } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCertificateById, CertificateRecord } from '@/services/certificateService';

// ── Shared result cards ───────────────────────────────────────────────────────

const ValidCard = ({ cert }: { cert: CertificateRecord }) => (
  <div className="space-y-5">
    <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
      <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
      <div>
        <p className="font-bold text-emerald-500 text-sm">Certificate Verified</p>
        <p className="text-emerald-600/80 dark:text-emerald-400/80 text-xs mt-0.5">
          This certificate is genuine and was issued by the NobzLearn platform.
        </p>
      </div>
    </div>

    <div className="rounded-2xl border border-border bg-secondary/30 overflow-hidden">
      {/* Certificate header */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/10 px-6 py-5 border-b border-border flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <Trophy size={22} className="text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">Certificate of Completion</p>
          <p className="font-bold text-foreground text-lg leading-tight">{cert.course_name}</p>
        </div>
      </div>

      {/* Details */}
      <div className="divide-y divide-border">
        <div className="flex items-center gap-3 px-6 py-4">
          <User size={15} className="text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Awarded to</p>
            <p className="font-semibold text-foreground text-sm">{cert.user_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-4">
          <Calendar size={15} className="text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Completed on</p>
            <p className="font-semibold text-foreground text-sm">
              {new Date(cert.completed_at ?? cert.issued_at).toLocaleDateString('en-ZA', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-4">
          <ShieldCheck size={15} className="text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Certificate ID</p>
            <p className="font-mono text-xs text-foreground break-all">{cert.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-4">
          <Calendar size={15} className="text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Issued on</p>
            <p className="font-semibold text-foreground text-sm">
              {new Date(cert.issued_at).toLocaleDateString('en-ZA', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
      <ShieldCheck size={14} className="text-primary shrink-0" />
      <p className="text-xs text-muted-foreground">
        Issued by <span className="font-semibold text-foreground">NobzTech Learning Platform</span> — nobztech.co.za
      </p>
    </div>
  </div>
);

const NotFoundCard = ({ label }: { label: string }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
    <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
    <div>
      <p className="font-bold text-red-400 text-sm">Certificate Not Found</p>
      <p className="text-red-400/70 text-xs mt-0.5">
        {label} does not match any certificate on our platform. If you believe this is an error,
        contact <a href="mailto:support@nobztech.co.za" className="underline">support@nobztech.co.za</a>.
      </p>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const VerifyCertificate = () => {
  const { id } = useParams<{ id?: string }>();
  const [input, setInput] = useState('');
  const [cert, setCert] = useState<CertificateRecord | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'not_found'>('idle');

  // Auto-lookup when UUID is in the URL (/verify/:id)
  useEffect(() => {
    if (!id) return;
    setStatus('loading');
    getCertificateById(id).then(result => {
      setCert(result);
      setStatus(result ? 'found' : 'not_found');
    });
  }, [id]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setStatus('loading');
    const result = await getCertificateById(trimmed);
    setCert(result);
    setStatus(result ? 'found' : 'not_found');
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
            Confirm the authenticity of a NobzLearn certificate instantly.
          </p>
        </div>

        {/* Auto-lookup via URL — show result directly */}
        {id ? (
          <div className="bg-card border border-border rounded-2xl p-8 shadow-soft">
            {status === 'loading' && (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 size={28} className="animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">Looking up certificate…</p>
              </div>
            )}
            {status === 'found' && cert && <ValidCard cert={cert} />}
            {status === 'not_found' && <NotFoundCard label={`The ID "${id}"`} />}
          </div>
        ) : (
          /* Manual search form */
          <div className="bg-card border border-border rounded-2xl p-8 shadow-soft">
            <form onSubmit={handleSearch} className="space-y-4 mb-4">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1.5">
                  Certificate ID
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={e => { setInput(e.target.value); setStatus('idle'); }}
                  placeholder="Paste the full certificate UUID"
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  The certificate ID is printed inside the verification box on every NobzLearn certificate PDF.
                </p>
              </div>
              <button
                type="submit"
                disabled={!input.trim() || status === 'loading'}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading'
                  ? <><Loader2 size={16} className="animate-spin" /> Verifying…</>
                  : <><Search size={16} /> Verify Certificate</>
                }
              </button>
            </form>

            {status === 'found' && cert && <ValidCard cert={cert} />}
            {status === 'not_found' && <NotFoundCard label="This ID" />}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          Questions? Email{' '}
          <a href="mailto:support@nobztech.co.za" className="text-primary hover:underline">
            support@nobztech.co.za
          </a>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyCertificate;
