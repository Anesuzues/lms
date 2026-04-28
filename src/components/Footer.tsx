import { Mail, MapPin, Heart, GraduationCap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <img src="/nexalearn-logo.png" alt="NexaLearn" className="h-8 w-auto mb-3" />
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Empowering students with the skills they need to thrive in the modern workplace.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><a href="/courses" className="hover:text-primary transition-colors">Course Catalog</a></li>
              <li><a href="/dashboard" className="hover:text-primary transition-colors">My Dashboard</a></li>
              <li><a href="/login" className="hover:text-primary transition-colors">Sign In</a></li>
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

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <p>© {new Date().getFullYear()} NexaLearn. All rights reserved.</p>
            <span className="hidden sm:block">·</span>
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <span>·</span>
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
