import { Button } from "@/components/ui/button";
import { ArrowRight, Award, CheckCircle, BookOpen, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LiveStats from "@/components/LiveStats";

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
      <div className="absolute bottom-32 right-4 sm:right-20 w-24 h-24 sm:w-32 sm:h-32 bg-accent/20 rounded-full blur-3xl animate-float pointer-events-none anim-delay-2s" />

      <div className="container relative z-10 py-24 sm:py-28 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">

          {/* Content */}
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full text-foreground text-xs sm:text-sm font-medium opacity-0 animate-fade-in border border-primary/20">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse-soft shadow-glow shrink-0" />
              4 Certificates · Free to Start
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight opacity-0 animate-fade-in anim-delay-100">
              Go From Beginner to <span className="text-gradient drop-shadow-sm">AI Developer</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl opacity-0 animate-fade-in anim-delay-200">
              A structured 4-certificate programme that takes you from AI fundamentals to building production-ready applications — step by step.
            </p>

            <div className="flex opacity-0 animate-fade-in anim-delay-300">
              <Button
                size="lg"
                className="group bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg transition-all hover:scale-105"
                onClick={() => navigate("/login")}
              >
                Start Your Journey
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Live stats */}
            <div className="pt-6 sm:pt-8 border-t border-border opacity-0 animate-fade-in anim-delay-400">
              <LiveStats />
            </div>
          </div>

          {/* Visual — lesson viewer mockup */}
          <div className="relative hidden md:block opacity-0 animate-scale-in anim-delay-300">
            <div className="relative w-full max-w-sm lg:max-w-md mx-auto">

              {/* App window chrome */}
              <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-border/60 hover-glow transition-all duration-500">
                {/* Top bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-card border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 mx-4 h-5 bg-secondary rounded-full text-[10px] text-muted-foreground flex items-center justify-center">
                    nobzlearn.co.za/learn
                  </div>
                  <div className="w-14" />
                </div>

                <div className="flex h-56 lg:h-64">
                  {/* Sidebar */}
                  <div className="w-36 shrink-0 bg-card border-r border-border p-2.5 space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide px-1 mb-2">Lessons</p>
                    {[
                      { title: 'AI Foundations', done: true },
                      { title: 'Prompt Engineering', done: true },
                      { title: 'Building AI Apps', done: false, active: true },
                      { title: 'RAG Systems', done: false },
                    ].map(({ title, done, active }) => (
                      <div key={title} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-500' : active ? 'bg-primary' : 'bg-secondary'}`}>
                          {done && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className="truncate">{title}</span>
                      </div>
                    ))}
                  </div>

                  {/* Reading pane */}
                  <div className="flex-1 p-4 overflow-hidden bg-background">
                    {/* Scroll progress bar */}
                    <div className="h-0.5 bg-secondary rounded-full mb-3 -mx-4 mt-[-16px]">
                      <div className="h-full w-3/5 bg-primary rounded-full" />
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <BookOpen className="w-3 h-3 text-primary" />
                      <span className="text-[9px] font-bold text-primary uppercase tracking-wide">Module 1</span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground mb-2 leading-tight">Writing a CV with AI Tools</h4>
                    <div className="space-y-1.5">
                      <div className="h-1.5 bg-secondary rounded-full w-full" />
                      <div className="h-1.5 bg-secondary rounded-full w-5/6" />
                      <div className="h-1.5 bg-secondary rounded-full w-full" />
                      <div className="h-1.5 bg-secondary rounded-full w-4/6" />
                    </div>
                    <div className="mt-4 flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-primary/30 rounded-full" />
                      <div className="h-1.5 bg-secondary rounded-full w-24" />
                    </div>
                    <button type="button" className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold">
                      <CheckCircle className="w-3 h-3" /> Mark as Read
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Badge — 100% Free */}
              <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-bold text-xs shadow-glow animate-float border-2 border-primary-foreground/20">
                100% Free
              </div>

              {/* Floating cert badge */}
              <div className="absolute -bottom-4 -left-4 glass-panel rounded-2xl p-3 animate-float anim-delay-1s shadow-lg border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 shrink-0">
                    <Award className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-foreground">Certificate Earned!</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {['TM','NZ','KP'].map(i => (
                        <div key={i} className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-accent border border-card flex items-center justify-center">
                          <span className="text-[6px] font-bold text-white">{i}</span>
                        </div>
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-1">+497 more</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-1" />
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
