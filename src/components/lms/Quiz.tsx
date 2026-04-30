import React, { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, ArrowRight, Trophy, AlertCircle } from 'lucide-react';
import { QuizQuestion, PASS_MARK, submitQuizAttempt } from '@/services/quizService';

interface QuizProps {
  questions: QuizQuestion[];
  courseId: string;
  moduleId: string;
  moduleName: string;
  userId: string;
  onPass: () => void;
  onRetry: () => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, courseId, moduleId, moduleName, userId, onPass, onRetry }) => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<number>(-1);

  const question = questions[current];
  const isLast = current === questions.length - 1;
  const allAnswered = answers.every(a => a !== -1);

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelected(idx);
  };

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
    } catch (err) {
      console.error('Quiz submit error:', err);
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
    onRetry();
  };

  // Results screen
  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950 p-6">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 max-w-md w-full text-center">
          {passed ? (
            <>
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                <Trophy size={36} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Module Passed!</h2>
              <p className="text-gray-400 mb-6">You scored <span className="text-emerald-400 font-bold text-xl">{score}%</span> on {moduleName}</p>
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${score}%` }} />
              </div>
              <button
                onClick={onPass}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center justify-center gap-2"
              >
                Continue to Next Module <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-5">
                <XCircle size={36} className="text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Not Quite</h2>
              <p className="text-gray-400 mb-2">You scored <span className="text-red-400 font-bold text-xl">{score}%</span></p>
              <p className="text-gray-500 text-sm mb-6">You need <span className="text-white font-semibold">{PASS_MARK}%</span> to pass. Review the lesson and try again.</p>
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${score}%` }} />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6 text-left">
                <AlertCircle size={16} className="text-amber-400 shrink-0" />
                <p className="text-amber-300 text-xs">Re-watch the video before retrying to improve your score.</p>
              </div>
              <button
                onClick={handleRetry}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} /> Try Again
              </button>
            </>
          )}

          {/* Answer review */}
          <div className="mt-6 text-left space-y-3">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Your Answers</p>
            {questions.map((q, i) => {
              const userAnswer = answers[i];
              const correct = userAnswer === q.correct;
              return (
                <div key={q.id} className={`p-3 rounded-xl border text-sm ${correct ? 'border-emerald-800 bg-emerald-900/20' : 'border-red-800 bg-red-900/20'}`}>
                  <p className="text-gray-300 font-medium mb-1">{i + 1}. {q.question}</p>
                  <p className={`text-xs ${correct ? 'text-emerald-400' : 'text-red-400'}`}>
                    {correct ? '✓' : '✗'} {q.options[userAnswer] ?? 'No answer'}
                    {!correct && <span className="text-gray-400"> · Correct: {q.options[q.correct]}</span>}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Quiz screen
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-950 p-6">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">{moduleName} — Quiz</p>
            <p className="text-sm text-gray-400">Question {current + 1} of {questions.length}</p>
          </div>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${
                i === current ? 'bg-primary' : answers[i] !== -1 ? 'bg-emerald-500' : 'bg-gray-700'
              }`} />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>

        {/* Question */}
        <h3 className="text-white font-bold text-lg mb-5 leading-snug">{question.question}</h3>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-4 rounded-xl border transition-all text-sm font-medium ${
                selected === idx
                  ? 'border-primary bg-primary/20 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600 hover:bg-gray-750'
              }`}
            >
              <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold mr-3 shrink-0 ${
                selected === idx ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              {option}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            disabled={current === 0}
            className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={selected === -1 || submitting}
              className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={selected === -1}
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
