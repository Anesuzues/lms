import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Trophy, ArrowRight, X } from 'lucide-react';
import { markOnboarded } from '@/services/profileService';

interface OnboardingModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

const STEPS = [
  {
    icon: BookOpen,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    title: (name: string) => `Welcome, ${name.split(' ')[0]}! 👋`,
    body: 'NobzLearn gives you everything you need to walk into your WIL placement with confidence: CV skills, interview techniques, workplace conduct, and AI tools.',
    cta: 'Show me how it works',
  },
  {
    icon: CheckCircle,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    title: () => 'Here\'s how it works',
    body: null,
    bullets: [
      { label: 'Read each lesson', sub: 'Lessons are 10-15 minutes. Read at your own pace.' },
      { label: 'Mark as Read', sub: 'Tap the button when you\'re done to unlock the next lesson.' },
      { label: 'Pass the quiz', sub: 'A short quiz at the end of each module checks what you\'ve learned.' },
      { label: 'Earn your certificate', sub: 'Complete all modules and pass the final exam to get certified.' },
    ],
    cta: 'Got it, what\'s first?',
  },
  {
    icon: Trophy,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    title: () => 'Your learning path is ready',
    body: 'You\'re enrolled in the NobzTech programme. Start with Module 1 today: it takes less than 20 minutes and sets the foundation for everything that follows.',
    cta: 'Start learning now',
  },
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ userId, userName, onClose }) => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  const handleClose = () => {
    markOnboarded(userId).catch(() => {});
    onClose();
  };

  const handleCta = () => {
    if (isLast) {
      markOnboarded(userId).catch(() => {});
      onClose();
      navigate('/courses');
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-300">

        {/* Close */}
        <div className="flex justify-end p-4 pb-0">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Skip onboarding"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 text-center">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-primary' : i < step ? 'w-3 bg-primary/40' : 'w-3 bg-secondary'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl ${current.iconBg} flex items-center justify-center mx-auto mb-6`}>
            <Icon size={28} className={current.iconColor} />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-foreground mb-3 leading-tight">
            {current.title(userName)}
          </h2>

          {/* Body or bullets */}
          {current.body && (
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">{current.body}</p>
          )}
          {current.bullets && (
            <ul className="space-y-3 mb-8 text-left">
              {current.bullets.map(b => (
                <li key={b.label} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-[7px]" />
                  <div>
                    <p className="text-sm font-bold text-foreground">{b.label}</p>
                    <p className="text-xs text-muted-foreground">{b.sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* CTA */}
          <button
            type="button"
            onClick={handleCta}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-glow"
          >
            {current.cta}
            {isLast ? <ArrowRight size={16} /> : null}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
