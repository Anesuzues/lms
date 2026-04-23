import { Mail, MapPin, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-card border-t border-border">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <img 
                src="/nexalearn-logo.png" 
                alt="NexaLearn" 
                className="h-8 w-auto"
              />
            </div>
            <p className="text-muted-foreground text-sm">Empowering students for the workplace</p>
          </div>

          {/* Contact */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-muted-foreground">
            <a href="mailto:learning@nobztech.co.za" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="w-4 h-4" />
              learning@nobztech.co.za
            </a>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              South Africa
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} NexaLearn. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-destructive fill-destructive" /> for students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
