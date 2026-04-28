import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 transition-all duration-300">
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <img src="/nexalearn-logo.png" alt="NexaLearn" className="h-10 w-auto" />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="/courses" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
              Courses
            </a>
            {isAuthenticated && (
              <a href="/dashboard" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                Dashboard
              </a>
            )}
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

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span>{user?.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-sm font-medium"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow hover:shadow-lg transition-all rounded-full px-6"
                  onClick={() => navigate("/login")}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-4">
              <a href="/courses" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors" onClick={() => setIsMenuOpen(false)}>
                Courses
              </a>
              {isAuthenticated && (
                <a href="/dashboard" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </a>
              )}
              <a href="/#modules" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>
                Modules
              </a>
              <a href="/#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>
                Benefits
              </a>
              <a href="/#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>
                Contact
              </a>
              {isAuthenticated ? (
                <Button variant="outline" className="w-full mt-2 gap-2" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              ) : (
                <Button
                  className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow rounded-full"
                  onClick={() => { navigate("/login"); setIsMenuOpen(false); }}
                >
                  Get Started
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
