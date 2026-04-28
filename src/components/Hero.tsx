import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Award, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-0 right-0 w-3/4 h-full bg-hero-gradient opacity-10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-primary/10 opacity-20 blur-3xl rounded-full -translate-x-1/4 translate-y-1/4" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-float" />
      <div className="absolute bottom-32 right-20 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="container relative z-10 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full text-foreground text-sm font-medium opacity-0 animate-fade-in border border-primary/20">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse-soft shadow-glow" />
              Free Course for All Students
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight opacity-0 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Get <span className="text-gradient drop-shadow-sm">Workplace Ready</span> with NexaLearn
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              A free 4-module course delivered via email. Watch videos, complete assessments, and get ready for Work Integrated Learning (WIL).
            </p>

            <div className="flex justify-start opacity-0 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button
                size="lg"
                className="group bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow rounded-full px-8 py-6 text-lg transition-all hover:scale-105"
                onClick={() => navigate("/login")}
              >
                Start Your Free Course
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
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
              <div className="absolute inset-8 glass-panel rounded-3xl p-8 flex flex-col justify-between hover-glow group transition-all duration-500">
                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6 shadow-glow transition-transform group-hover:scale-110 duration-500">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 tracking-tight">Your Journey Starts Here</h3>
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
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-sm shadow-glow animate-float border-2 border-primary-foreground/20">
                100% Free
              </div>

              {/* Progress Badge */}
              <div className="absolute bottom-4 left-4 glass-panel rounded-2xl p-4 animate-float hover-glow" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
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
