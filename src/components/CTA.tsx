import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center text-primary-foreground">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Start Your Journey Today
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Become Workplace Ready?
          </h2>

          <p className="text-lg md:text-xl opacity-90 mb-10 max-w-xl mx-auto">
            Sign up and get instant access to all 4 modules. Complete them to qualify for our workplace readiness workshops.
          </p>

          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              onClick={() => navigate("/login")}
            >
              Start Your Free Course
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <p className="mt-8 text-sm opacity-75">
            No credit card required • Instant access • Self-paced learning
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
