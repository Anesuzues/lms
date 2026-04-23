import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Award, Briefcase } from "lucide-react";

interface HeroProps {
  intakeFormUrl: string;
  onOpenForm: () => void;
}

const Hero = ({ intakeFormUrl, onOpenForm }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-background" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-hero-gradient opacity-5 blur-3xl" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-float" />
      <div className="absolute bottom-32 right-20 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="container relative z-10 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-secondary-foreground text-sm font-medium opacity-0 animate-fade-in">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse-soft" />
              Free Course for All Students
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight opacity-0 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Get <span className="text-gradient">Workplace Ready</span> with NexaLearn
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              A free 4-module course delivered via email. Watch videos, complete assessments, and get ready for Work Integrated Learning (WIL).
            </p>

            <div className="flex justify-center opacity-0 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button
                variant="hero"
                size="lg"
                className="group"
                onClick={onOpenForm}
              >
                Start Your Free Course
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <Users className="w-5 h-5" />
                  <span className="text-2xl font-bold">500+</span>
                </div>
                <p className="text-sm text-muted-foreground">Students Enrolled</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <Award className="w-5 h-5" />
                  <span className="text-2xl font-bold">4</span>
                </div>
                <p className="text-sm text-muted-foreground">Modules</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <Briefcase className="w-5 h-5" />
                  <span className="text-2xl font-bold">3</span>
                </div>
                <p className="text-sm text-muted-foreground">Workshops</p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative hidden lg:block opacity-0 animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Main Card */}
              <div className="absolute inset-8 bg-card rounded-3xl shadow-card p-8 flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-hero-gradient rounded-2xl flex items-center justify-center mb-6">
                    <Briefcase className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Your Journey Starts Here</h3>
                  <p className="text-muted-foreground">CV Building • Interview Skills • Workplace Conduct</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-secondary border-2 border-card" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">Join 500+ students</span>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-full font-semibold text-sm shadow-soft animate-float">
                100% Free
              </div>

              {/* Progress Badge */}
              <div className="absolute bottom-4 left-4 bg-card rounded-2xl shadow-card p-4 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Certificate Ready</p>
                    <p className="text-xs text-muted-foreground">Upon completion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
