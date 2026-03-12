'use client'

import { useState, useEffect } from 'react'
import HeroSection from '@/components/home/HeroSection'
import TopicPills from '@/components/home/TopicPills'
import JourneyCard from '@/components/journeys/JourneyCard'
import { mockJourneys, generateMockCourses } from '@/lib/data'
import { useInView } from 'react-intersection-observer'

export default function HomePage() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [userCourses, setUserCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const { ref, inView } = useInView({
    threshold: 0,
  })

  // Initialize courses only on client
  useEffect(() => {
    setUserCourses(generateMockCourses(20))
    setMounted(true)
  }, [])

  const handleTopicClick = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  const loadMoreCourses = () => {
    if (loading) return
    setLoading(true)
    
    setTimeout(() => {
      setUserCourses((prev) => [...prev, ...generateMockCourses(20)])
      setLoading(false)
    }, 1000)
  }

  useEffect(() => {
    if (inView && mounted) {
      loadMoreCourses()
    }
  }, [inView, mounted])

  if (!mounted) {
    return (
      <div>
        <HeroSection />
        <TopicPills selectedTopics={selectedTopics} onTopicClick={handleTopicClick} />

        {/* Learning Journeys Section */}
        <section className="py-12 bg-white">
          <div className="container-custom">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Learning Journeys</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockJourneys.map((journey) => (
                <JourneyCard key={journey.id} journey={journey} />
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div>
      <HeroSection />
      <TopicPills selectedTopics={selectedTopics} onTopicClick={handleTopicClick} />

      {/* Learning Journeys Section */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">Learning Journeys</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockJourneys.map((journey) => (
              <JourneyCard key={journey.id} journey={journey} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
