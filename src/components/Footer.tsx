import { Mail, MapPin, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 mb-8 sm:mb-10">
          {/* Brand */}
          <div>
            <img src="/nobzlearn-logo.png" alt="NobzLearn" className="h-8 w-auto mb-3" />
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Empowering students with the skills they need to thrive in the modern workplace.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/courses" className="hover:text-primary transition-colors">Course Catalog</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">My Dashboard</Link></li>
              <li><Link to="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a href="mailto:learning@nobztech.co.za" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail className="w-4 h-4 shrink-0" /> learning@nobztech.co.za
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" /> South Africa
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-border flex flex-col gap-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <p>© {new Date().getFullYear()} NobzLearn. All rights reserved.</p>
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-destructive fill-destructive" /> for students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
