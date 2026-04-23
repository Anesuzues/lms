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
    <section id="modules" className="py-20 lg:py-32 bg-background">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm font-medium mb-4">
            Course Curriculum
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            4 Modules to <span className="text-gradient">Success</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Each module builds on the previous one, taking you step-by-step from research skills to workplace readiness.
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {modules.map((module, index) => (
            <Card 
              key={module.number}
              className="group relative overflow-hidden border-0 shadow-card hover:shadow-lg transition-all duration-500 hover:-translate-y-1 opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-start gap-5">
                  {/* Icon */}
                  <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center shrink-0 shadow-soft`}>
                    <module.icon className="w-7 h-7 text-white" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-card rounded-full flex items-center justify-center text-xs font-bold shadow-sm border border-border">
                      {module.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">{module.title}</h3>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sm font-medium text-primary">{module.subtitle}</p>
                    <p className="text-muted-foreground">{module.description}</p>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="mt-6 pt-4 border-t border-border flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    1-2 Video Lessons
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-2 h-2 bg-accent rounded-full" />
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
