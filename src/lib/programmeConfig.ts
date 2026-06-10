export interface CertificateConfig {
  number: number;
  certName: string;
  shortName: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  gradient: string;
  badge: string;
  // All course titles that belong to this certificate (modules + final exam)
  courseTitles: string[];
  // Just the final exam titles
  finalExamTitles: string[];
}

export const CERTIFICATES: CertificateConfig[] = [
  {
    number: 1,
    certName: 'Certificate 1: AI Digital Professional',
    shortName: 'AI Digital Professional',
    description: 'Master workplace readiness, AI tools, and digital productivity to launch your professional career.',
    level: 'Beginner',
    gradient: 'from-blue-600 to-cyan-500',
    badge: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
    courseTitles: [
      'Foundations of Modern Technology',
      'Foundation of Modern Technology',
      'Technology Foundations',
      'Working Smarter with AI',
      'Digital Productivity for Professionals',
      'Certificate 1 Final Exam',
      'AI Digital Professional: Final Exam',
    ],
    finalExamTitles: [
      'Certificate 1 Final Exam',
      'AI Digital Professional: Final Exam',
    ],
  },
  {
    number: 2,
    certName: 'Certificate 2: Junior Software Developer',
    shortName: 'Junior Software Developer',
    description: 'Go from zero to job-ready: learn programming, web development, and how to build real applications.',
    level: 'Intermediate',
    gradient: 'from-violet-600 to-purple-500',
    badge: 'bg-violet-500/20 text-violet-200 border-violet-400/30',
    courseTitles: [
      'Introduction to Programming',
      'Programming with AI Assistance',
      'Web Development Fundamentals',
      'Understanding Software Projects',
      'Debugging and Problem Solving',
      'Building Real Applications',
      'Certificate 2 Final Exam',
      'Junior Software Developer: Final Exam',
    ],
    finalExamTitles: [
      'Certificate 2 Final Exam',
      'Junior Software Developer: Final Exam',
    ],
  },
  {
    number: 3,
    certName: 'Certificate 3: AI-Enhanced Developer',
    shortName: 'AI-Enhanced Developer',
    description: 'Level up with prompt engineering, professional testing, and technical documentation skills.',
    level: 'Intermediate',
    gradient: 'from-emerald-600 to-teal-500',
    badge: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
    courseTitles: [
      'Prompt Engineering for Developers',
      'Testing and Quality Assurance',
      'Technical Documentation and Communication',
      'Certificate 3 Final Exam',
      'AI-Enhanced Developer: Final Exam',
    ],
    finalExamTitles: [
      'Certificate 3 Final Exam',
      'AI-Enhanced Developer: Final Exam',
    ],
  },
  {
    number: 4,
    certName: 'Certificate 4: AI Application Developer',
    shortName: 'AI Application Developer',
    description: 'Build production-ready AI applications, autonomous agents, and RAG systems.',
    level: 'Advanced',
    gradient: 'from-orange-500 to-amber-400',
    badge: 'bg-orange-500/20 text-orange-200 border-orange-400/30',
    courseTitles: [
      'Building Your First AI Application',
      'Introduction to AI Agents',
      'Introduction to RAG Systems',
      'Professional Developer Skills',
      'Industry Capstone Project',
      'Certificate 4 Final Exam',
      'AI Application Developer: Final Exam',
    ],
    finalExamTitles: [
      'Certificate 4 Final Exam',
      'AI Application Developer: Final Exam',
    ],
  },
  {
    number: 5,
    certName: 'Workplace Readiness Certificate',
    shortName: 'Workplace Ready Professional',
    description: 'Prepare for Work Integrated Learning with CV skills, interview techniques, professional conduct, and AI literacy.',
    level: 'Beginner',
    gradient: 'from-sky-600 to-indigo-500',
    badge: 'bg-sky-500/20 text-sky-200 border-sky-400/30',
    // The course is its own final exam: completing all modules unlocks the
    // course quiz, and passing it issues this certificate.
    courseTitles: [
      'Get Workplace Ready with NobzLearn',
      'Get Workplace Ready with NexaLearn',
    ],
    finalExamTitles: [
      'Get Workplace Ready with NobzLearn',
      'Get Workplace Ready with NexaLearn',
    ],
  },
];

// Normalize a title for matching: lowercase, treat dashes/colons as spaces,
// drop the legacy "Certified" prefix. This lets the clean config titles above
// still match older database course titles (e.g. "Certified X — Final Exam").
function normalizeTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/[—–:-]/g, ' ')
    .replace(/\bcertified\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Return the certificate a course belongs to, or null
export function getCertForCourse(title: string): CertificateConfig | null {
  const lower = normalizeTitle(title);
  return (
    CERTIFICATES.find(c =>
      c.courseTitles.some(t => lower.includes(normalizeTitle(t)))
    ) ?? null
  );
}

// Is this course title a final exam?
export function isFinalExam(title: string): boolean {
  const lower = normalizeTitle(title);
  return CERTIFICATES.some(c =>
    c.finalExamTitles.some(t => lower.includes(normalizeTitle(t)))
  );
}

// Get non-final-exam (prerequisite) course titles for a certificate
export function getPrerequisiteTitles(cert: CertificateConfig): string[] {
  const finalNorm = cert.finalExamTitles.map(normalizeTitle);
  return cert.courseTitles.filter(t => !finalNorm.includes(normalizeTitle(t)));
}
