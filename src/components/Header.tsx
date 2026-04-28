import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, GraduationCap } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsMenuOpen(false);
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-primary font-bold border-b-2 border-primary pb-0.5"
      : "text-muted-foreground hover:text-foreground transition-colors";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/40 transition-all duration-300">
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <img src="/nexalearn-logo.png" alt="NexaLearn" className="h-9 w-auto" />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="/courses" className={`text-sm ${isActive("/courses")}`}>Courses</a>
            {isAuthenticated ? (
              <a href="/dashboard" className={`text-sm ${isActive("/dashboard")}`}>Dashboard</a>
            ) : (
              <>
                <a href="/#modules" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Modules</a>
                <a href="/#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Benefits</a>
                <a href="/#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
              </>
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 pl-3 pr-4 py-1.5 rounded-full bg-secondary border border-border">
                  <img src={user?.avatar} alt={user?.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-primary/20" />
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive gap-1.5">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="text-sm font-medium" onClick={() => navigate("/login")}>Sign In</Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 shadow-glow" onClick={() => navigate("/login")}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            {isAuthenticated && (
              <div className="flex items-center gap-3 p-3 mb-3 rounded-xl bg-secondary">
                <img src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-sm">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </div>
            )}
            <nav className="flex flex-col gap-1">
              <a href="/courses" className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors" onClick={() => setIsMenuOpen(false)}>Courses</a>
              {isAuthenticated ? (
                <a href="/dashboard" className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors" onClick={() => setIsMenuOpen(false)}>Dashboard</a>
              ) : (
                <>
                  <a href="/#modules" className="px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors" onClick={() => setIsMenuOpen(false)}>Modules</a>
                  <a href="/#benefits" className="px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors" onClick={() => setIsMenuOpen(false)}>Benefits</a>
                  <a href="/#contact" className="px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</a>
                </>
              )}
              <div className="pt-3 mt-2 border-t border-border">
                {isAuthenticated ? (
                  <Button variant="outline" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive hover:text-white" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" /> Sign Out
                  </Button>
                ) : (
                  <Button className="w-full bg-primary text-primary-foreground rounded-full" onClick={() => { navigate("/login"); setIsMenuOpen(false); }}>
                    Get Started
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
