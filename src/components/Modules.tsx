import { Card, CardContent } from "@/components/ui/card";
import { Search, FileText, Users, Briefcase, ChevronRight } from "lucide-react";

const modules = [
  {
    number: 0,
    title: "Foundations",
    subtitle: "AI Literacy & Research Mindset",
    description: "Build baseline AI understanding and learn how AI fits into learning and work. Perfect foundation for WIL preparation.",
    icon: Search,
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: 1,
    title: "CV & AI",
    subtitle: "CV Creation with AI Prompt Engineering",
    description: "Learn to communicate your skills clearly using AI. Master ethical AI use for CV and cover letter creation.",
    icon: FileText,
    color: "from-emerald-500 to-teal-500",
  },
  {
    number: 2,
    title: "Interview Readiness",
    subtitle: "Confidence & Structured Responses",
    description: "Reduce interview anxiety and improve responses using AI mock interview tools and preparation techniques.",
    icon: Users,
    color: "from-amber-500 to-orange-500",
  },
  {
    number: 3,
    title: "Work Conduct & WIL",
    subtitle: "Professional Behavior & Workplace Expectations",
    description: "Shift mindset from student to employee. Master job search maturity and workplace conduct for WIL success.",
    icon: Briefcase,
    color: "from-violet-500 to-purple-500",
  },
];

const Modules = () => {
  return (
    <section id="modules" className="py-16 sm:py-20 lg:py-32 bg-background">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="inline-block px-4 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm font-medium mb-4">
            Course Curriculum
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            4 Modules to <span className="text-gradient">Success</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Each module builds on the previous one, taking you step-by-step from research skills to workplace readiness.
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {modules.map((module, index) => (
            <Card
              key={module.number}
              className="group relative overflow-hidden glass-panel hover-glow hover:-translate-y-1 transition-all duration-500 opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-5 sm:p-6 lg:p-8">
                <div className="flex items-start gap-4 sm:gap-5">
                  {/* Icon */}
                  <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center shrink-0 shadow-glow transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                    <module.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-card rounded-full flex items-center justify-center text-xs font-bold shadow-sm border border-border">
                      {module.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg sm:text-xl font-bold truncate">{module.title}</h3>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-primary">{module.subtitle}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{module.description}</p>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border flex flex-wrap items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                    1-2 Video Lessons
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <span className="w-2 h-2 bg-accent rounded-full shrink-0" />
                    Reflection Form
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Flow indicator */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Complete each module in order • Progress tracked automatically • Unlock workshops upon completion
          </p>
        </div>
      </div>
    </section>
  );
};

export default Modules;
