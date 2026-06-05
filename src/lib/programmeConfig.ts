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
    certName: 'Certificate 1: Certified AI Digital Professional',
    shortName: 'Certified AI Digital Professional',
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
      'Certified AI Digital Professional — Final Exam',
    ],
    finalExamTitles: [
      'Certificate 1 Final Exam',
      'Certified AI Digital Professional — Final Exam',
    ],
  },
  {
    number: 2,
    certName: 'Certificate 2: Certified Junior Software Developer',
    shortName: 'Certified Junior Software Developer',
    description: 'Go from zero to job-ready — learn programming, web development, and how to build real applications.',
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
      'Certified Junior Software Developer — Final Exam',
    ],
    finalExamTitles: [
      'Certificate 2 Final Exam',
      'Certified Junior Software Developer — Final Exam',
    ],
  },
  {
    number: 3,
    certName: 'Certificate 3: Certified AI-Enhanced Developer',
    shortName: 'Certified AI-Enhanced Developer',
    description: 'Level up with prompt engineering, professional testing, and technical documentation skills.',
    level: 'Intermediate',
    gradient: 'from-emerald-600 to-teal-500',
    badge: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
    courseTitles: [
      'Prompt Engineering for Developers',
      'Testing and Quality Assurance',
      'Technical Documentation and Communication',
      'Certificate 3 Final Exam',
      'Certified AI-Enhanced Developer — Final Exam',
    ],
    finalExamTitles: [
      'Certificate 3 Final Exam',
      'Certified AI-Enhanced Developer — Final Exam',
    ],
  },
  {
    number: 4,
    certName: 'Certificate 4: Certified AI Application Developer',
    shortName: 'Certified AI Application Developer',
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
      'Certified AI Application Developer — Final Exam',
    ],
    finalExamTitles: [
      'Certificate 4 Final Exam',
      'Certified AI Application Developer — Final Exam',
    ],
  },
];

// Return the certificate a course belongs to, or null
export function getCertForCourse(title: string): CertificateConfig | null {
  const lower = title.toLowerCase();
  return (
    CERTIFICATES.find(c =>
      c.courseTitles.some(t => lower.includes(t.toLowerCase()))
    ) ?? null
  );
}

// Is this course title a final exam?
export function isFinalExam(title: string): boolean {
  const lower = title.toLowerCase();
  return CERTIFICATES.some(c =>
    c.finalExamTitles.some(t => lower.includes(t.toLowerCase()))
  );
}

// Get non-final-exam (prerequisite) course titles for a certificate
export function getPrerequisiteTitles(cert: CertificateConfig): string[] {
  const finalLower = cert.finalExamTitles.map(t => t.toLowerCase());
  return cert.courseTitles.filter(t => !finalLower.includes(t.toLowerCase()));
}
