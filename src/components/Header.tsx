import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  intakeFormUrl: string;
  onOpenForm: () => void;
}

const Header = ({ intakeFormUrl, onOpenForm }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <img 
              src="/nexalearn-logo.png" 
              alt="NexaLearn" 
              className="h-10 w-auto"
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="/courses" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
              Courses
            </a>
            <a href="/dashboard" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
              Dashboard
            </a>
            <a href="/#modules" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Modules
            </a>
            <a href="/#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Benefits
            </a>
            <a href="/#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>

          {/* CTA */}
          <div className="hidden md:block">
            <Button 
              variant="default"
              onClick={onOpenForm}
            >
              Start Your Free Course
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-4">
              <a 
                href="/courses" 
                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Courses
              </a>
              <a 
                href="/dashboard" 
                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </a>
              <a 
                href="/#modules" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Modules
              </a>
              <a 
                href="/#benefits" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Benefits
              </a>
              <a 
                href="/#contact" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
              <Button 
                variant="default" 
                className="w-full mt-2"
                onClick={() => {
                  onOpenForm();
                  setIsMenuOpen(false);
                }}
              >
                Start Your Free Course
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
