import { CheckCircle2, Zap, Clock, GraduationCap, Video, Mail } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "100% Free",
    description: "No hidden costs. Everything you need to get workplace ready at zero cost.",
  },
  {
    icon: Video,
    title: "Video Lessons",
    description: "Learn at your own pace with clear, practical video content.",
  },
  {
    icon: Clock,
    title: "Self-Paced",
    description: "Complete modules on your schedule. No deadlines, no pressure.",
  },
  {
    icon: Mail,
    title: "Auto Progress",
    description: "Receive the next module automatically when you complete each one.",
  },
  {
    icon: GraduationCap,
    title: "Live Workshops",
    description: "Get invited to CV, Interview, and WIL workshops upon completion.",
  },
  {
    icon: CheckCircle2,
    title: "Certificate",
    description: "Earn a completion certificate to show future employers.",
  },
];

const Benefits = () => {
  return (
    <section className="py-20 lg:py-32 bg-secondary/50">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-card text-foreground rounded-full text-sm font-medium mb-4">
            Why NexaLearn?
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Everything You Need to <span className="text-gradient">Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We've designed this course specifically for students preparing for their first professional experiences.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={benefit.title}
              className="group p-6 lg:p-8 bg-card rounded-2xl shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <benefit.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
