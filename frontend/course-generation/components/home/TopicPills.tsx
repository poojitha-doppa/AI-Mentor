'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

const topics = [
  'Python', 'JavaScript', 'UI/UX Design', 'Quantum Mechanics', 'Italian',
  'Data Science', 'Machine Learning', 'Web Development', 'Mobile Development',
  'DevOps', 'Cloud Computing', 'Blockchain', 'Cybersecurity', 'AI Ethics',
  'Digital Marketing', 'Content Writing', 'Photography', 'Video Editing',
  'Music Production', 'Graphic Design', 'Business Strategy', 'Finance',
  'Economics', 'Psychology', 'Philosophy', 'History', 'Biology', 'Chemistry',
  'Physics', 'Mathematics', 'Statistics', 'Public Speaking'
]

interface TopicPillsProps {
  selectedTopics?: string[]
  onTopicClick?: (topic: string) => void
}

export default function TopicPills({ selectedTopics = [], onTopicClick }: TopicPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const handleTopicClick = (topic: string) => {
    // Navigate to course generation flow
    router.push(`/generate/${encodeURIComponent(topic)}`)
  }

  return (
    <section className="py-8 bg-white">
      <div className="container-custom">
        <div className="relative">
          {/* Scroll Left Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Topic Pills */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide px-10"
          >
            {topics.map((topic) => {
              const isSelected = selectedTopics.includes(topic)
              return (
                <button
                  key={topic}
                  onClick={() => handleTopicClick(topic)}
                  className={`topic-pill ${isSelected ? 'topic-pill-active' : ''}`}
                >
                  {topic}
                </button>
              )
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
