import Link from 'next/link'
import { Course } from '@/types'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface CourseCardProps {
  course: Course
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/course/${course.slug}`}>
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer h-full p-4">
        {course.thumbnail && (
          <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-purple-200 rounded-lg mb-4"></div>
        )}
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {course.topics.slice(0, 3).map((topic) => (
            <span
              key={topic.id}
              className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full"
            >
              {topic.name}
            </span>
          ))}
        </div>

        <div className="flex items-center text-sm text-gray-500 mt-auto">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(course.publishedDate), 'do MMM, yyyy')}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
