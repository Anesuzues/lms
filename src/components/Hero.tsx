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

      {/* Floating decorative blobs — contained within overflow-hidden */}
      <div className="absolute top-20 left-4 sm:left-10 w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full blur-2xl animate-float pointer-events-none" />
      <div className="absolute bottom-32 right-4 sm:right-20 w-24 h-24 sm:w-32 sm:h-32 bg-accent/20 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="container relative z-10 py-24 sm:py-28 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">

          {/* Content */}
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full text-foreground text-xs sm:text-sm font-medium opacity-0 animate-fade-in border border-primary/20">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse-soft shadow-glow shrink-0" />
              Free Course for All Students
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight opacity-0 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Get <span className="text-gradient drop-shadow-sm">Workplace Ready</span> with NexaLearn
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              A free 4-module course delivered via email. Watch videos, complete assessments, and get ready for Work Integrated Learning (WIL).
            </p>

            <div className="flex opacity-0 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button
                size="lg"
                className="group bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg transition-all hover:scale-105"
                onClick={() => navigate("/login")}
              >
                Start Your Free Course
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 sm:pt-8 border-t border-border opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {[
                { icon: Users, value: '500+', label: 'Students' },
                { icon: Award, value: '4', label: 'Modules' },
                { icon: Briefcase, value: '3', label: 'Workshops' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-primary">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span className="text-xl sm:text-2xl font-bold">{value}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual — hidden on mobile, shown from md up */}
          <div className="relative hidden md:block opacity-0 animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative w-full aspect-square max-w-sm lg:max-w-lg mx-auto">
              {/* Main Card */}
              <div className="absolute inset-8 glass-panel rounded-3xl p-6 lg:p-8 flex flex-col justify-between hover-glow group transition-all duration-500">
                <div>
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4 lg:mb-6 shadow-glow transition-transform group-hover:scale-110 duration-500">
                    <Briefcase className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h3 className="text-lg lg:text-2xl font-bold mb-2 tracking-tight">Your Journey Starts Here</h3>
                  <p className="text-sm lg:text-base text-muted-foreground">CV Building • Interview Skills • Workplace Conduct</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-secondary border-2 border-card" />
                    ))}
                  </div>
                  <span className="text-xs lg:text-sm text-muted-foreground">Join 500+ students</span>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1.5 lg:px-4 lg:py-2 rounded-full font-bold text-xs lg:text-sm shadow-glow animate-float border-2 border-primary-foreground/20">
                100% Free
              </div>

              {/* Progress Badge */}
              <div className="absolute bottom-4 left-4 glass-panel rounded-2xl p-3 lg:p-4 animate-float hover-glow" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shrink-0">
                    <Award className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs lg:text-sm">Certificate Ready</p>
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
