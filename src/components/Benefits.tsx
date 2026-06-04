import { Trophy, BookOpen, Clock, Lock, Bot, CheckCircle2 } from "lucide-react";

const benefits = [
  {
    icon: Trophy,
    title: "4 Certificates",
    description: "Earn industry-recognised certificates from Beginner through to Advanced AI Developer.",
  },
  {
    icon: BookOpen,
    title: "Structured Lessons",
    description: "Learn through rich, well-structured reading content with quizzes to test your understanding.",
  },
  {
    icon: Clock,
    title: "Self-Paced",
    description: "Complete each certificate on your schedule — no deadlines, no pressure.",
  },
  {
    icon: Lock,
    title: "Sequential Unlocking",
    description: "Content unlocks in order so you build skills properly before moving to the next level.",
  },
  {
    icon: Bot,
    title: "AI-Powered Learning",
    description: "Every certificate integrates AI tools so you graduate work-ready in a modern tech environment.",
  },
  {
    icon: CheckCircle2,
    title: "Verified Certificates",
    description: "Each certificate is verifiable and shareable — prove your skills to future employers.",
  },
];

const Benefits = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-32 bg-secondary/50">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="inline-block px-4 py-1.5 bg-card text-foreground rounded-full text-sm font-medium mb-4">
            Why NobzLearn?
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Everything You Need to <span className="text-gradient">Succeed</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            One complete programme — from AI fundamentals to building production applications — designed to make you job-ready.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {benefits.map((benefit, index) => {
            const delayClass = ['anim-delay-0','anim-delay-100','anim-delay-200','anim-delay-300','anim-delay-400','anim-delay-500'][index] ?? '';
            return (
            <div
              key={benefit.title}
              className={`group p-5 sm:p-6 lg:p-8 glass-panel hover-glow transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fade-in ${delayClass}`}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-glow transition-all duration-300">
                <benefit.icon className="w-6 h-6 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
