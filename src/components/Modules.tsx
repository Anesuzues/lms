import { Card, CardContent } from "@/components/ui/card";
import { Cpu, Code2, Wand2, Rocket, ChevronRight, Trophy } from "lucide-react";

const certificates = [
  {
    number: 1,
    title: "AI Digital Professional",
    subtitle: "Workplace Readiness & AI Productivity",
    description: "Master workplace foundations, AI tools, and digital productivity to launch your professional career.",
    icon: Cpu,
    color: "from-blue-600 to-cyan-500",
    level: "Beginner",
    modules: 3,
  },
  {
    number: 2,
    title: "Junior Software Developer",
    subtitle: "Programming, Web Dev & Real Applications",
    description: "Go from zero to job-ready: learn programming, web development, and how to build real applications.",
    icon: Code2,
    color: "from-violet-600 to-purple-500",
    level: "Intermediate",
    modules: 6,
  },
  {
    number: 3,
    title: "AI-Enhanced Developer",
    subtitle: "Prompt Engineering, Testing & Docs",
    description: "Level up with prompt engineering, professional testing, and technical documentation skills.",
    icon: Wand2,
    color: "from-emerald-600 to-teal-500",
    level: "Intermediate",
    modules: 3,
  },
  {
    number: 4,
    title: "AI Application Developer",
    subtitle: "Agents, RAG Systems & Production Apps",
    description: "Build production-ready AI applications, autonomous agents, and RAG systems.",
    icon: Rocket,
    color: "from-orange-500 to-amber-400",
    level: "Advanced",
    modules: 5,
  },
];

const LEVEL_COLORS: Record<string, string> = {
  Beginner:     "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Intermediate: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Advanced:     "bg-red-500/15 text-red-600 dark:text-red-400",
};

const Modules = () => {
  return (
    <section id="modules" className="py-16 sm:py-20 lg:py-32 bg-background">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="inline-block px-4 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm font-medium mb-4">
            Learning Pathway
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            4 Certificates to <span className="text-gradient">Mastery</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Each certificate builds on the last: from AI fundamentals all the way to shipping production AI applications.
          </p>
        </div>

        {/* Certificate Pathway — a step-by-step journey down a connecting rail */}
        <div className="relative max-w-4xl mx-auto">
          {/* The rail: runs behind the step markers, drawing itself downward */}
          <div
            className="absolute left-6 sm:left-8 top-8 bottom-8 w-0.5 pathway-rail animate-draw-down hidden sm:block"
            aria-hidden="true"
          />

          <div className="space-y-4 sm:space-y-6">
            {certificates.map((cert, index) => {
              const delayClass = ['anim-delay-0','anim-delay-100','anim-delay-200','anim-delay-300'][index] ?? '';
              return (
                <div
                  key={cert.number}
                  className={`relative flex items-stretch gap-4 sm:gap-6 opacity-0 animate-fade-in-up ${delayClass}`}
                >
                  {/* Step marker on the rail */}
                  <div className="hidden sm:flex shrink-0 w-16 justify-center pt-6">
                    <div className={`relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-br ${cert.color} flex items-center justify-center shadow-glow ring-4 ring-background`}>
                      <span className="text-base font-extrabold text-white">{cert.number}</span>
                    </div>
                  </div>

                  {/* Step card */}
                  <Card className="group flex-1 min-w-0 relative overflow-hidden glass-panel hover-glow hover:-translate-y-1 transition-all duration-500">
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex items-start gap-4">
                        {/* Icon — also the step number on mobile, where the rail is hidden */}
                        <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${cert.color} flex items-center justify-center shrink-0 shadow-glow transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                          <cert.icon className="w-6 h-6 text-white" />
                          <span className="sm:hidden absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-card">
                            {cert.number}
                          </span>
                        </div>

                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-lg sm:text-xl font-bold leading-snug break-words">{cert.title}</h3>
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-primary break-words">{cert.subtitle}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed break-words">{cert.description}</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                          {cert.modules} Modules
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <span className="w-2 h-2 bg-accent rounded-full shrink-0" />
                          Final Exam
                        </div>
                        <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-semibold ${LEVEL_COLORS[cert.level]}`}>
                          {cert.level}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}

            {/* Rail endpoint — the payoff at the bottom of the journey */}
            <div className="relative flex items-center gap-4 sm:gap-6 opacity-0 animate-fade-in-up anim-delay-400">
              <div className="hidden sm:flex shrink-0 w-16 justify-center">
                <div className="relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center shadow-glow ring-4 ring-background">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-3 py-3">
                <Trophy className="w-5 h-5 text-amber-500 shrink-0 sm:hidden" />
                <p className="font-bold text-base sm:text-lg break-words">
                  Certified AI Application Developer
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Flow indicator */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Complete each certificate in order • Sequential module unlocking • Exam opens after all modules
          </p>
        </div>
      </div>
    </section>
  );
};

export default Modules;
