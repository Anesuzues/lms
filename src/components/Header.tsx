import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Sun, Moon, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import ProfileEditModal from "@/components/ProfileEditModal";
import FeedbackModal from "@/components/FeedbackModal";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsMenuOpen(false);
  };

  const handleAnchorNav = (hash: string) => {
    setIsMenuOpen(false);
    if (location.pathname === '/') {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-primary font-bold border-b-2 border-primary pb-0.5"
      : "text-muted-foreground hover:text-foreground transition-colors";

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/40 transition-all duration-300">
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/nobzlearn-new-logo.jpeg" alt="NobzLearn" className="h-9 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/courses" className={`text-sm ${isActive("/courses")}`}>Courses</Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className={`text-sm ${isActive("/dashboard")}`}>Dashboard</Link>
            ) : (
              <>
                <button type="button" onClick={() => handleAnchorNav('modules')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Modules</button>
                <button type="button" onClick={() => handleAnchorNav('benefits')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Benefits</button>
                <button type="button" onClick={() => handleAnchorNav('contact')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</button>
              </>
            )}
          </nav>

          {/* Desktop Auth + Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFeedback(true)}
              aria-label="Help & Feedback"
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              title="Help & Feedback"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-2.5 pl-3 pr-4 py-1.5 rounded-full bg-secondary border border-border hover:border-primary/40 transition-colors"
                  aria-label="Edit profile"
                >
                  <img src={user?.avatar} alt={user?.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-primary/20" />
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                </button>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive gap-1.5">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="text-sm font-medium" onClick={() => navigate("/login")}>Sign In</Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 shadow-glow" onClick={() => navigate("/login?mode=signup")}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
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
              <Link to="/courses" className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors" onClick={() => setIsMenuOpen(false)}>Courses</Link>
              {isAuthenticated ? (
                <Link to="/dashboard" className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              ) : (
                <>
                  <button type="button" onClick={() => handleAnchorNav('modules')} className="px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors text-left">Modules</button>
                  <button type="button" onClick={() => handleAnchorNav('benefits')} className="px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors text-left">Benefits</button>
                  <button type="button" onClick={() => handleAnchorNav('contact')} className="px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors text-left">Contact</button>
                </>
              )}
              <button
                type="button"
                onClick={() => { setShowFeedback(true); setIsMenuOpen(false); }}
                className="px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors text-left flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> Help & Feedback
              </button>
              <div className="pt-3 mt-2 border-t border-border">
                {isAuthenticated ? (
                  <Button variant="outline" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive hover:text-white" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" /> Sign Out
                  </Button>
                ) : (
                  <Button className="w-full bg-primary text-primary-foreground rounded-full" onClick={() => { navigate("/login?mode=signup"); setIsMenuOpen(false); }}>
                    Get Started
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>

    {showProfile && <ProfileEditModal onClose={() => setShowProfile(false)} />}
    {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </>
  );
};

export default Header;
