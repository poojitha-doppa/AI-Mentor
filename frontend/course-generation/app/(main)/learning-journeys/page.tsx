import JourneyCard from '@/components/journeys/JourneyCard'
import { mockJourneys } from '@/lib/data'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LearningJourneysPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-12">
        <Link
          href="/home"
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Learning Journeys</h1>
          <p className="text-xl text-gray-600">
            Expert-curated learning paths designed to take you from beginner to professional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockJourneys.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
        </div>
      </div>
    </div>
  )
}
