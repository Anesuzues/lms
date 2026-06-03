import { Card, CardContent } from "@/components/ui/card";
import { Cpu, Code2, Wand2, Rocket, ChevronRight } from "lucide-react";

const certificates = [
  {
    number: 1,
    title: "Certified AI Digital Professional",
    subtitle: "Workplace Readiness & AI Productivity",
    description: "Master workplace foundations, AI tools, and digital productivity to launch your professional career.",
    icon: Cpu,
    color: "from-blue-600 to-cyan-500",
    level: "Beginner",
    modules: 3,
  },
  {
    number: 2,
    title: "Certified Junior Software Developer",
    subtitle: "Programming, Web Dev & Real Applications",
    description: "Go from zero to job-ready — learn programming, web development, and how to build real applications.",
    icon: Code2,
    color: "from-violet-600 to-purple-500",
    level: "Intermediate",
    modules: 6,
  },
  {
    number: 3,
    title: "Certified AI-Enhanced Developer",
    subtitle: "Prompt Engineering, Testing & Docs",
    description: "Level up with prompt engineering, professional testing, and technical documentation skills.",
    icon: Wand2,
    color: "from-emerald-600 to-teal-500",
    level: "Intermediate",
    modules: 3,
  },
  {
    number: 4,
    title: "Certified AI Application Developer",
    subtitle: "Agents, RAG Systems & Production Apps",
    description: "Build production-ready AI applications, autonomous agents, and RAG systems.",
    icon: Rocket,
    color: "from-orange-500 to-amber-400",
    level: "Advanced",
    modules: 5,
  },
];

const LEVEL_COLORS: Record<string, string> = {
  Beginner:     "bg-emerald-500/15 text-emerald-400",
  Intermediate: "bg-amber-500/15 text-amber-400",
  Advanced:     "bg-red-500/15 text-red-400",
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
            Each certificate builds on the last — from AI fundamentals all the way to shipping production AI applications.
          </p>
        </div>

        {/* Certificate Cards */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {certificates.map((cert, index) => {
            const delayClass = ['anim-delay-0','anim-delay-100','anim-delay-200','anim-delay-300'][index] ?? '';
            return (
              <Card
                key={cert.number}
                className={`group relative overflow-hidden glass-panel hover-glow hover:-translate-y-1 transition-all duration-500 opacity-0 animate-fade-in-up ${delayClass}`}
              >
                <CardContent className="p-5 sm:p-6 lg:p-8">
                  <div className="flex items-start gap-4 sm:gap-5">
                    {/* Icon */}
                    <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${cert.color} flex items-center justify-center shrink-0 shadow-glow transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                      <cert.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-card rounded-full flex items-center justify-center text-xs font-bold shadow-sm border border-border">
                        {cert.number}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg sm:text-xl font-bold leading-snug">{cert.title}</h3>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-primary">{cert.subtitle}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{cert.description}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border flex flex-wrap items-center gap-3 sm:gap-4">
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
            );
          })}
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
