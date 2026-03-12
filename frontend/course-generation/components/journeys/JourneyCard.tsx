import Link from 'next/link'
import { LearningJourney } from '@/types'

interface JourneyCardProps {
  journey: LearningJourney
}

export default function JourneyCard({ journey }: JourneyCardProps) {
  return (
    <Link href={`/learning-journeys/${journey.slug}`}>
      <div className="card hover:border hover:border-primary-200 transition-all cursor-pointer h-full">
        {journey.thumbnail && (
          <div className="w-full h-40 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-4"></div>
        )}
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {journey.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {journey.description}
        </p>
      </div>
    </Link>
  )
}
