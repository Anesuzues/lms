import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, Trophy, AlertCircle } from 'lucide-react';
import { QuizQuestion, PASS_MARK, submitQuizAttempt } from '@/services/quizService';
import { useToast } from '@/components/ui/use-toast';
import { updateStreakAndXP } from '@/services/profileService';

interface QuizProps {
  questions: QuizQuestion[];
  courseId: string;
  moduleId: string;
  moduleName: string;
  userId: string;
  onPass: () => void;
  onRetry: () => void;
  skipResultsOnPass?: boolean;
}

const WidthBar = ({ pct, className }: { pct: number; className: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.style.width = `${pct}%`;
  }, [pct]);
  return <div ref={ref} className={className} />;
};

const Quiz: React.FC<QuizProps> = ({ questions, courseId, moduleId, moduleName, userId, onPass, onRetry, skipResultsOnPass = false }) => {
  const { toast } = useToast();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<number>(-1);
  const [isRetry, setIsRetry] = useState(false);

  const question = questions[current];
  const isLast = current === questions.length - 1;
  const effectiveAnswers = answers.map((a, i) => (i === current ? selected : a));
  const allAnswered = effectiveAnswers.every(a => a !== -1);
  const answeredCount = effectiveAnswers.filter(a => a !== -1).length;

  const handleSelect = (idx: number) => { if (!submitted) setSelected(idx); };

  const handleNext = () => {
    const updated = [...answers];
    updated[current] = selected;
    setAnswers(updated);
    setSelected(answers[current + 1] ?? -1);
    setCurrent(c => c + 1);
  };

  const handleBack = () => {
    const updated = [...answers];
    updated[current] = selected;
    setAnswers(updated);
    setSelected(answers[current - 1] ?? -1);
    setCurrent(c => c - 1);
  };

  const handleSubmit = async () => {
    const finalAnswers = [...answers];
    finalAnswers[current] = selected;
    setAnswers(finalAnswers);
    setSubmitting(true);
    try {
      const attempt = await submitQuizAttempt(userId, courseId, moduleId, finalAnswers, questions);
      setScore(attempt.score);
      setPassed(attempt.passed);
      setSubmitted(true);
      if (attempt.passed) {
        const xp = isRetry ? 25 : 50;
        const result = await updateStreakAndXP(userId, xp);
        if (result.leveledUp) {
          toast({ title: `Level up! You're now a ${result.newLevelName}!`, description: `+${xp} XP for passing the quiz.` });
        } else if (result.streakBonus) {
          toast({ title: '🔥 7-day streak! +100 bonus XP', description: 'You\'ve been learning every day this week.' });
        }
        if (skipResultsOnPass) {
          onPass();
          return;
        }
      }
    } catch (err) {
      console.error('Quiz submit error:', err);
      toast({ title: 'Submission failed', description: 'Could not save your quiz attempt. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setCurrent(0);
    setAnswers(Array(questions.length).fill(-1));
    setSelected(-1);
    setSubmitted(false);
    setScore(0);
    setPassed(false);
    setIsRetry(true);
    onRetry();
  };

  // ── Results screen ──────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-4 sm:p-6 overflow-y-auto">
        <div className="bg-card rounded-2xl border border-border p-5 sm:p-8 max-w-md w-full text-center my-4 shadow-card">
          {passed ? (
            <>
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
                <Trophy size={36} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Module Passed!</h2>
              <p className="text-muted-foreground mb-6">
                You scored <span className="text-emerald-500 font-bold text-xl">{score}%</span> on {moduleName}
              </p>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden mb-6">
                <WidthBar pct={score} className="h-full bg-emerald-500 rounded-full transition-[width] duration-700" />
              </div>
              <button
                type="button"
                onClick={onPass}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-colors flex items-center justify-center gap-2 shadow-glow"
              >
                Continue <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
                <XCircle size={36} className="text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Not Quite</h2>
              <p className="text-muted-foreground mb-2">
                You scored <span className="text-destructive font-bold text-xl">{score}%</span>
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                You need <span className="text-foreground font-semibold">{PASS_MARK}%</span> to pass. Review the lesson and try again.
              </p>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden mb-6">
                <WidthBar pct={score} className="h-full bg-destructive rounded-full transition-[width] duration-700" />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6 text-left">
                <AlertCircle size={16} className="text-amber-500 shrink-0" />
                <p className="text-amber-600 dark:text-amber-400 text-xs">
                  Re-read the lesson carefully before retrying to improve your score.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold transition-colors flex items-center justify-center gap-2 border border-border"
              >
                <RotateCcw size={16} /> Try Again
              </button>
            </>
          )}

          {/* Answer review */}
          <div className="mt-6 text-left space-y-3">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Your Answers</p>
            {questions.map((q, i) => {
              const userAnswer = answers[i];
              const correct = userAnswer === q.correct;
              return (
                <div key={q.id} className={`p-3 rounded-xl border text-sm ${correct ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-destructive/30 bg-destructive/5'}`}>
                  <p className="text-foreground font-medium mb-1">{i + 1}. {q.question}</p>
                  <p className={`text-xs flex items-center gap-1 ${correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                    {correct ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                    {correct ? 'Correct' : 'Incorrect'} — {q.options[userAnswer] ?? 'No answer'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz screen ─────────────────────────────────────────────────
  const quizPct = Math.round(((current + 1) / questions.length) * 100);

  return (
    <div className="flex-1 flex items-center justify-center bg-background p-4 sm:p-6 overflow-y-auto">
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-8 max-w-lg w-full my-4 shadow-card">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
              {moduleName} — Quiz
            </p>
            <p className="text-sm text-muted-foreground">Question {current + 1} of {questions.length}</p>
          </div>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === current ? 'bg-primary' : answers[i] !== -1 ? 'bg-emerald-500' : 'bg-secondary'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden mb-6">
          <WidthBar pct={quizPct} className="h-full bg-primary rounded-full transition-[width] duration-300" />
        </div>

        {/* Question */}
        <h3 className="text-foreground font-bold text-lg mb-5 leading-snug">{question.question}</h3>

        {/* Options */}
        <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
          {question.options.map((option, idx) => {
            const optionId = `q${current}-opt${idx}`;
            const isSelected = selected === idx;
            return (
              <label
                key={idx}
                htmlFor={optionId}
                className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all text-sm font-medium min-h-[48px] flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-secondary/40 text-foreground hover:border-primary/40 hover:bg-secondary'
                }`}
              >
                <input
                  type="radio"
                  id={optionId}
                  name={`question-${current}`}
                  value={idx}
                  checked={isSelected}
                  onChange={() => handleSelect(idx)}
                  className="sr-only"
                />
                <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="break-words min-w-0">{option}</span>
              </label>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={current === 0}
            aria-label="Go to previous question"
            className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {isLast ? (
            <div className="flex-1 flex flex-col gap-1.5">
              {!allAnswered && (
                <p className="text-xs text-amber-500 text-center">
                  {answeredCount}/{questions.length} answered — go back and complete all questions
                </p>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={selected === -1}
              aria-label={`Go to question ${current + 2}`}
              className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Next <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
