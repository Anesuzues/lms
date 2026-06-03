const testimonials = [
  {
    initials: 'TM',
    name: 'Tebogo Mokoena',
    institution: 'Software Developer',
    cert: 'Certified AI Digital Professional',
    quote:
      'Certificate 1 gave me the AI fundamentals I was missing. I went from knowing nothing about AI tools to using them confidently at work — all before my first job.',
    color: 'from-blue-600 to-cyan-500',
  },
  {
    initials: 'NZ',
    name: 'Nomsa Zulu',
    institution: 'Junior Developer',
    cert: 'Certified Junior Software Developer',
    quote:
      'The sequential structure is what made the difference. Each course built on the last and by the time I finished Certificate 2 I had built real applications I could show in interviews.',
    color: 'from-violet-600 to-purple-500',
  },
  {
    initials: 'KP',
    name: 'Katlego Phiri',
    institution: 'AI Application Developer',
    cert: 'Certified AI Application Developer',
    quote:
      'I completed all 4 certificates and landed a role building AI applications. The final exam for each certificate really tests you — passing them felt like a genuine achievement.',
    color: 'from-emerald-600 to-teal-500',
  },
];

const Testimonials = () => (
  <section className="py-16 sm:py-20 lg:py-28 bg-background">
    <div className="container">
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <span className="inline-block px-4 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm font-medium mb-4">
          Student Stories
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
          Real Students. <span className="text-gradient">Real Results.</span>
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground">
          Hear from people who completed the NobzLearn certificate programme and levelled up their careers.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="glass-panel p-6 rounded-2xl flex flex-col gap-4 hover-glow transition-all duration-300 hover:-translate-y-1"
          >
            {/* Stars */}
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Quote */}
            <p className="text-foreground/80 text-sm leading-relaxed flex-1">"{t.quote}"</p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center shrink-0`}>
                <span className="text-xs font-bold text-white">{t.initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground truncate">{t.institution}</p>
                <p className="text-xs text-primary font-medium truncate mt-0.5">{t.cert}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
