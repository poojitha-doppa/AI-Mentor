import { LearningJourney, Course, Topic, User } from '@/types'

// Mock Data - Replace with actual database calls

export const mockTopics: Topic[] = [
  { id: '1', name: 'Python', slug: 'python' },
  { id: '2', name: 'JavaScript', slug: 'javascript' },
  { id: '3', name: 'UI/UX Design', slug: 'ui-ux-design' },
  { id: '4', name: 'Data Science', slug: 'data-science' },
  { id: '5', name: 'Machine Learning', slug: 'machine-learning' },
]

export const mockEducator: User = {
  id: '2',
  name: 'Jane Educator',
  email: 'educator@example.com',
  role: 'educator',
  createdAt: new Date(),
}

export const mockJourneys: LearningJourney[] = [
  {
    id: '1',
    title: 'Full Stack Web Development Mastery',
    slug: 'full-stack-web-development',
    subtitle: 'From Zero to Hero in Modern Web Development',
    description: 'Master the complete web development stack including HTML, CSS, JavaScript, React, Node.js, and databases. Build real-world projects and deploy them to production.',
    whoIsFor: 'This journey is perfect for beginners who want to become professional web developers, career changers looking to enter tech, and developers who want to update their skills.',
    whoIsNotFor: 'This is not for those looking for quick shortcuts or those who already have extensive full-stack experience.',
    publishedDate: new Date('2025-12-29'),
    startDate: new Date('2026-01-15'),
    creatorId: '2',
    creator: mockEducator,
    courses: [],
    courseCount: 6,
  },
  {
    id: '2',
    title: 'Data Science & Machine Learning Path',
    slug: 'data-science-ml-path',
    subtitle: 'Transform Data into Insights',
    description: 'Learn Python, statistics, data analysis, visualization, and machine learning. Work on real datasets and build predictive models.',
    whoIsFor: 'Ideal for aspiring data scientists, analysts wanting to level up, and developers interested in AI/ML.',
    whoIsNotFor: 'Not suitable for those without basic programming knowledge or strong math phobia.',
    publishedDate: new Date('2025-12-28'),
    creatorId: '2',
    creator: mockEducator,
    courses: [],
    courseCount: 8,
  },
  {
    id: '3',
    title: 'UI/UX Design Professional',
    slug: 'ui-ux-design-professional',
    subtitle: 'Design Beautiful and Functional Experiences',
    description: 'Master user research, wireframing, prototyping, visual design, and usability testing. Learn industry-standard tools like Figma and Adobe XD.',
    whoIsFor: 'Perfect for aspiring designers, developers wanting to improve design skills, and career switchers.',
    whoIsNotFor: 'Not for those looking only for graphic design or illustration skills.',
    publishedDate: new Date('2025-12-27'),
    creatorId: '2',
    creator: mockEducator,
    courses: [],
    courseCount: 5,
  },
]

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Python for Beginners - Complete Guide',
    slug: 'python-for-beginners',
    description: 'Learn Python from scratch. Master variables, functions, loops, OOP, and more. Build real projects.',
    publishedDate: new Date('2025-12-20'),
    creatorId: '2',
    creator: mockEducator,
    topics: [mockTopics[0], mockTopics[4]],
    journeyId: '2',
  },
  {
    id: '2',
    title: 'JavaScript Fundamentals',
    slug: 'javascript-fundamentals',
    description: 'Master modern JavaScript ES6+. Learn variables, functions, async programming, and DOM manipulation.',
    publishedDate: new Date('2025-12-18'),
    creatorId: '2',
    creator: mockEducator,
    topics: [mockTopics[1]],
    journeyId: '1',
  },
  {
    id: '3',
    title: 'React - Building Modern UIs',
    slug: 'react-modern-uis',
    description: 'Build dynamic user interfaces with React. Learn hooks, state management, routing, and best practices.',
    publishedDate: new Date('2025-12-15'),
    creatorId: '2',
    creator: mockEducator,
    topics: [mockTopics[1]],
    journeyId: '1',
  },
  {
    id: '4',
    title: 'Figma for UI Design',
    slug: 'figma-ui-design',
    description: 'Master Figma from basics to advanced. Create wireframes, prototypes, and design systems.',
    publishedDate: new Date('2025-12-10'),
    creatorId: '2',
    creator: mockEducator,
    topics: [mockTopics[2]],
    journeyId: '3',
  },
]

// Generate more mock courses for infinite scroll
export function generateMockCourses(count: number): Course[] {
  const titles = [
    'Advanced', 'Mastering', 'Complete Guide to', 'Introduction to',
    'Deep Dive into', 'Practical', 'Professional', 'Ultimate'
  ]
  const subjects = [
    'TypeScript', 'Node.js', 'Docker', 'AWS', 'GraphQL',
    'MongoDB', 'PostgreSQL', 'CSS Animation', 'Next.js',
    'Vue.js', 'Angular', 'Python Django', 'Flask', 'FastAPI'
  ]

  const courses: Course[] = []
  for (let i = 0; i < count; i++) {
    const title = `${titles[i % titles.length]} ${subjects[i % subjects.length]}`
    courses.push({
      id: `course-${i + 100}`,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      description: `Learn ${subjects[i % subjects.length]} through hands-on projects and real-world examples. Perfect for developers looking to expand their skills.`,
      publishedDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      creatorId: '2',
      creator: mockEducator,
      topics: [mockTopics[Math.floor(Math.random() * mockTopics.length)]],
    })
  }
  return courses
}
