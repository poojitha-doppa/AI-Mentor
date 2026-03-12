export interface User {
  id: string;
  email: string;
  name: string;
  role: 'learner' | 'educator' | 'admin';
  avatar?: string;
  createdAt: Date;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  publishedDate: Date;
  creatorId: string;
  creator?: User;
  topics: Topic[];
  thumbnail?: string;
  journeyId?: string;
  journey?: LearningJourney;
  enrollmentCount?: number;
}

export interface LearningJourney {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  whoIsFor?: string;
  whoIsNotFor?: string;
  publishedDate: Date;
  startDate?: Date;
  creatorId: string;
  creator?: User;
  courses: Course[];
  courseCount: number;
  thumbnail?: string;
  enrollmentCount?: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId?: string;
  journeyId?: string;
  enrolledAt: Date;
  progress?: number;
}

export interface EducatorApplication {
  id: string;
  userId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
}

export interface SearchFilters {
  query?: string;
  topics?: string[];
  difficulty?: string;
  duration?: string;
  language?: string;
}
