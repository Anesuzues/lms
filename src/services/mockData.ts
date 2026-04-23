export interface Lesson {
  id: string;
  title: string;
  duration: string; // e.g., '10:00'
  type: 'video' | 'text' | 'quiz';
  contentUrl?: string; // Video URL or text content
  isCompleted: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  price: number | 'Free';
  modules: Module[];
}

export const MOCK_COURSES: Course[] = [
  {
    id: 'course-nexalearn-wil',
    title: 'Get Workplace Ready with NexaLearn',
    description: 'A free 4-module course delivered via email. Watch videos, complete assessments, and get ready for Work Integrated Learning (WIL).',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
    instructor: 'NexaLearn Team',
    level: 'Beginner',
    duration: '4 weeks',
    price: 'Free',
    modules: [
      {
        id: 'module-1',
        title: 'CV Building',
        lessons: [
          { id: 'lesson-1', title: 'Crafting the Perfect CV', duration: '15:00', type: 'video', isCompleted: false },
          { id: 'lesson-2', title: 'CV Templates & Review', duration: '10:00', type: 'text', isCompleted: false },
        ]
      },
      {
        id: 'module-2',
        title: 'Interview Skills',
        lessons: [
          { id: 'lesson-3', title: 'Common Interview Questions', duration: '20:00', type: 'video', isCompleted: false },
          { id: 'lesson-4', title: 'Mock Interview Quiz', duration: '15 mins', type: 'quiz', isCompleted: false },
        ]
      },
      {
        id: 'module-3',
        title: 'Workplace Conduct',
        lessons: [
          { id: 'lesson-5', title: 'Professional Communication', duration: '12:00', type: 'video', isCompleted: false },
          { id: 'lesson-6', title: 'Email Etiquette', duration: '08:00', type: 'text', isCompleted: false },
        ]
      },
      {
        id: 'module-4',
        title: 'Final Assessment',
        lessons: [
          { id: 'lesson-7', title: 'Workplace Readiness Test', duration: '30 mins', type: 'quiz', isCompleted: false },
        ]
      }
    ]
  },
  {
    id: 'course-2',
    title: 'Advanced Professional Development',
    description: 'Take your career to the next level with advanced strategies for professional growth and networking.',
    thumbnail: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800',
    instructor: 'Jane Doe',
    level: 'Advanced',
    duration: '6 hours',
    price: 49.99,
    modules: [
      {
        id: 'module-adv-1',
        title: 'Networking Strategies',
        lessons: [
          { id: 'lesson-adv-1', title: 'Building Meaningful Connections', duration: '12:00', type: 'video', isCompleted: false }
        ]
      }
    ]
  }
];

export const getCourseById = (id: string): Course | undefined => {
  return MOCK_COURSES.find(c => c.id === id);
};
