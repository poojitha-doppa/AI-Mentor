'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowRight, Sparkles } from 'lucide-react'

interface Question {
  id: number
  type: 'text' | 'single-choice' | 'multiple-choice'
  question: string
  placeholder?: string
  options?: string[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Categorize topics to provide relevant questions
const getTopicCategory = (topic: string): 'technical' | 'academic' | 'language' | 'creative' | 'business' => {
  const topicLower = topic.toLowerCase()
  
  // Technical/Programming
  if (topicLower.match(/programming|code|coding|javascript|python|java|c\+\+|react|angular|vue|web dev|software|data structure|algorithm|api|database|sql|nosql|machine learning|ai|artificial intelligence|devops|cloud|aws|azure|cybersecurity|blockchain/)) {
    return 'technical'
  }
  
  // Languages
  if (topicLower.match(/english|spanish|french|german|chinese|japanese|korean|hindi|language|grammar|vocabulary|pronunciation/)) {
    return 'language'
  }
  
  // Creative
  if (topicLower.match(/art|drawing|painting|music|guitar|piano|photography|design|ui|ux|graphic|video editing|animation|creative writing/)) {
    return 'creative'
  }
  
  // Business
  if (topicLower.match(/business|marketing|finance|management|economics|accounting|entrepreneurship|sales|stock market|investing/)) {
    return 'business'
  }
  
  // Academic (default for school subjects)
  return 'academic'
}

const generateQuestions = (topic: string): Question[] => {
  const category = getTopicCategory(topic)
  
  const baseQuestions: Question[] = [
    {
      id: 1,
      type: 'text',
      question: 'Nice, you want to learn {topic}. First, can you tell me your name so I can personalize things for you?',
      placeholder: 'Type your answer...',
    },
  ]
  
  // Question 2: Main Goal (varies by category)
  if (category === 'technical') {
    baseQuestions.push({
      id: 2,
      type: 'single-choice',
      question: 'Nice to meet you, {name}. What is your main goal with learning {topic}?',
      options: [
        'Job interviews preparation',
        'Build personal projects',
        'Career advancement',
        'Learn for fun/hobby',
        'Quick overview - I need basics fast',
      ],
    })
  } else if (category === 'academic') {
    baseQuestions.push({
      id: 2,
      type: 'single-choice',
      question: 'Nice to meet you, {name}. What is your main goal with learning {topic}?',
      options: [
        'School/College exams',
        'Competitive exams preparation',
        'General knowledge',
        'Career/Professional growth',
        'Personal interest',
      ],
    })
  } else if (category === 'language') {
    baseQuestions.push({
      id: 2,
      type: 'single-choice',
      question: 'Nice to meet you, {name}. What is your main goal with learning {topic}?',
      options: [
        'Travel and communication',
        'Career opportunities',
        'Academic requirements',
        'Connect with native speakers',
        'Personal enrichment',
      ],
    })
  } else if (category === 'creative') {
    baseQuestions.push({
      id: 2,
      type: 'single-choice',
      question: 'Nice to meet you, {name}. What is your main goal with learning {topic}?',
      options: [
        'Start a creative career',
        'Personal hobby/passion',
        'Improve existing skills',
        'Create content for social media',
        'Express myself artistically',
      ],
    })
  } else { // business
    baseQuestions.push({
      id: 2,
      type: 'single-choice',
      question: 'Nice to meet you, {name}. What is your main goal with learning {topic}?',
      options: [
        'Start my own business',
        'Career advancement',
        'Professional certification',
        'Better job opportunities',
        'General business knowledge',
      ],
    })
  }
  
  // Common questions (3-6)
  baseQuestions.push(
    {
      id: 3,
      type: 'single-choice',
      question: 'What is your current experience level with {topic}?',
      options: [
        'Complete beginner - Never studied this before',
        'Beginner - I know the basics',
        'Intermediate - I have some experience',
        'Advanced - I\'m quite experienced',
        'Expert - I know this very well',
      ],
    },
    {
      id: 4,
      type: 'single-choice',
      question: 'How much time can you dedicate to learning {topic} per day?',
      options: [
        'Less than 30 minutes',
        '30 minutes to 1 hour',
        '1-2 hours',
        '2-3 hours',
        'More than 3 hours',
      ],
    },
    {
      id: 5,
      type: 'single-choice',
      question: 'What\'s your preferred learning style?',
      options: category === 'technical'
        ? [
            'Visual - Diagrams and videos',
            'Hands-on - Coding exercises and practice',
            'Reading - Documentation and tutorials',
            'Mixed - Combination of all',
          ]
        : category === 'language'
        ? [
            'Conversational - Speaking and listening',
            'Visual - Videos and images',
            'Reading - Books and articles',
            'Interactive - Games and exercises',
          ]
        : [
            'Visual - Videos and demonstrations',
            'Hands-on - Practice and exercises',
            'Reading - Books and articles',
            'Mixed - Combination of all',
          ],
    },
    {
      id: 6,
      type: 'single-choice',
      question: 'When do you want to complete learning {topic}?',
      options: [
        'Within 1 week',
        'Within 2 weeks',
        'Within 1 month',
        '1-3 months',
        'More than 3 months - I\'m not in a hurry',
      ],
    }
  )
  
  // Question 7: Areas of Interest (varies by category)
  if (category === 'technical') {
    baseQuestions.push({
      id: 7,
      type: 'multiple-choice',
      question: 'Which specific areas of {topic} are you most interested in? (Select all that apply)',
      options: [
        'Core concepts and fundamentals',
        'Practical coding projects',
        'Interview preparation',
        'Best practices and patterns',
        'Advanced topics',
        'Real-world applications',
      ],
    })
  } else if (category === 'academic') {
    baseQuestions.push({
      id: 7,
      type: 'multiple-choice',
      question: 'Which specific areas of {topic} are you most interested in? (Select all that apply)',
      options: [
        'Theory and concepts',
        'Problem-solving techniques',
        'Exam-focused preparation',
        'Practical applications',
        'Historical context',
        'Current trends and developments',
      ],
    })
  } else if (category === 'language') {
    baseQuestions.push({
      id: 7,
      type: 'multiple-choice',
      question: 'Which specific areas of {topic} are you most interested in? (Select all that apply)',
      options: [
        'Grammar and structure',
        'Vocabulary building',
        'Conversation skills',
        'Reading comprehension',
        'Writing skills',
        'Pronunciation and accent',
      ],
    })
  } else if (category === 'creative') {
    baseQuestions.push({
      id: 7,
      type: 'multiple-choice',
      question: 'Which specific areas of {topic} are you most interested in? (Select all that apply)',
      options: [
        'Basic techniques and skills',
        'Creative expression',
        'Project-based learning',
        'Professional practices',
        'Style and aesthetics',
        'Advanced techniques',
      ],
    })
  } else {
    baseQuestions.push({
      id: 7,
      type: 'multiple-choice',
      question: 'Which specific areas of {topic} are you most interested in? (Select all that apply)',
      options: [
        'Fundamental concepts',
        'Practical strategies',
        'Case studies and examples',
        'Professional applications',
        'Current trends',
        'Advanced topics',
      ],
    })
  }
  
  // Questions 8-9
  baseQuestions.push(
    {
      id: 8,
      type: 'single-choice',
      question: category === 'technical' 
        ? 'Do you prefer to learn with real-world projects or theoretical exercises?'
        : category === 'language'
        ? 'How do you prefer to practice {topic}?'
        : 'How do you prefer to learn {topic}?',
      options: category === 'technical'
        ? [
            'Real-world projects',
            'Theoretical exercises',
            'A mix of both',
          ]
        : category === 'language'
        ? [
            'Conversation practice',
            'Written exercises',
            'A mix of both',
          ]
        : [
            'Practical examples',
            'Theoretical concepts',
            'A mix of both',
          ],
    },
    {
      id: 9,
      type: 'single-choice',
      question: 'How do you want to track your progress?',
      options: category === 'technical'
        ? [
            'Quizzes and coding challenges',
            'Building projects',
            'Practice problems',
            'All of the above',
          ]
        : category === 'language'
        ? [
            'Vocabulary tests',
            'Conversation practice',
            'Writing exercises',
            'All of the above',
          ]
        : [
            'Quizzes and assessments',
            'Practical assignments',
            'Self-evaluation',
            'All of the above',
          ],
    },
    {
      id: 10,
      type: 'text',
      question: 'Is there anything specific about {topic} you want to focus on or any challenges you\'ve faced before?',
      placeholder: 'Type your answer... (optional)',
    }
  )
  
  return baseQuestions
}

export default function GenerateCoursePage() {
  const params = useParams()
  const topic = decodeURIComponent(params.topic as string)
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [textInput, setTextInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [showReview, setShowReview] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true)
  const [questionError, setQuestionError] = useState<string | null>(null)

  // Fetch dynamic questions from API when topic changes
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoadingQuestions(true)
      setQuestionError(null)
      
      try {
        console.log('Fetching questions for topic:', topic)
        const response = await fetch(`${API_BASE_URL}/courses/generate-questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to generate questions')
        }
        
        const data = await response.json()
        console.log('Received questions:', data.questions)
        
        // Add the name question at the beginning
        const questionsWithName = [
          {
            id: 1,
            type: 'text' as const,
            question: `Nice, you want to learn ${topic}. First, can you tell me your name so I can personalize things for you?`,
            placeholder: 'Type your answer...',
          },
          ...data.questions.map((q: Question, index: number) => ({
            ...q,
            id: index + 2, // Adjust IDs since we added the name question
          }))
        ]
        
        setQuestions(questionsWithName)
      } catch (error) {
        console.error('Error fetching questions:', error)
        setQuestionError('Failed to load questions. Please try refreshing the page.')
      } finally {
        setIsLoadingQuestions(false)
      }
    }
    
    fetchQuestions()
  }, [topic])

  const totalSteps = questions.length
  const currentQuestion = questions[currentStep - 1]
  const userName = answers[1] as string || 'there'

  const replaceTokens = (text: string) => {
    return text.replace('{topic}', topic).replace('{name}', userName)
  }

  const handleNext = () => {
    const isLastQuestion = currentStep === totalSteps
    
    if (currentQuestion.type === 'text' && textInput.trim()) {
      setAnswers({ ...answers, [currentStep]: textInput.trim() })
      setTextInput('')
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      } else {
        setShowReview(true)
      }
    } else if (currentQuestion.type === 'text' && isLastQuestion) {
      // Last question is optional
      setAnswers({ ...answers, [currentStep]: textInput.trim() })
      setShowReview(true)
    }
  }

  const handleOptionSelect = (option: string) => {
    if (currentQuestion.type === 'single-choice') {
      setAnswers({ ...answers, [currentStep]: option })
      setTimeout(() => {
        if (currentStep < totalSteps) {
          setCurrentStep(currentStep + 1)
        } else {
          setShowReview(true)
        }
      }, 300)
    } else if (currentQuestion.type === 'multiple-choice') {
      const current = (answers[currentStep] as string[]) || []
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option]
      setAnswers({ ...answers, [currentStep]: updated })
    }
  }

  const handleMultipleChoiceNext = () => {
    if ((answers[currentStep] as string[])?.length > 0) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      } else {
        setShowReview(true)
      }
    }
  }

  const generateCourse = async () => {
    setIsGenerating(true)
    setGenerateError(null)
    
    try {
      console.log('Starting course generation...')
      console.log('Topic:', topic)
      console.log('Answers:', answers)

      let response
      try {
        response = await fetch('/api/generate-course', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic,
            answers,
          }),
          signal: AbortSignal.timeout(180000), // 3 minute timeout for Mixtral
        })
      } catch (fetchErr) {
        console.error('Fetch error:', fetchErr)
        if (fetchErr instanceof TypeError && fetchErr.message.includes('fetch')) {
          throw new Error('Network error: Unable to reach the server. Check your internet connection.')
        }
        throw fetchErr
      }

      console.log('API Response Status:', response.status)
      
      let data
      try {
        data = await response.json()
      } catch (jsonErr) {
        console.error('JSON parse error:', jsonErr)
        throw new Error('Invalid response from server. The API may be temporarily unavailable.')
      }
      
      console.log('API Response Data:', data)

      if (!response.ok) {
        console.error('API Error Response:', data)
        const errorMessage = data.message || data.error || data.details || `Server error: ${response.statusText}`
        throw new Error(errorMessage)
      }

      // Verify course data exists
      if (!data.course) {
        console.error('No course data in response:', data)
        throw new Error('No course data received from server. The API may not be responding correctly.')
      }

      console.log('Course generated successfully:', data.course.title)

      // Persist the course to MongoDB backend
      let courseId: string | null = null
      try {
        const saveResponse = await fetch('/api/courses/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ course: data.course }),
        })

        const saveJson = await saveResponse.json()
        if (!saveResponse.ok) {
          console.warn('Failed to persist course to backend, falling back to localStorage', saveJson)
        } else {
          courseId = saveJson.courseId
        }
      } catch (persistErr) {
        console.warn('Persist error (fallback to localStorage):', persistErr)
      }

      // Store locally as a fallback
      console.log('Storing course in localStorage...')
      console.log('📚 Modules count:', data.course.modules?.length)
      console.log('📚 First module has reading materials:', !!data.course.modules?.[0]?.readingMaterials)
      console.log('📚 Reading materials count:', data.course.modules?.[0]?.readingMaterials?.length || 0)
      localStorage.setItem('generatedCourse', JSON.stringify({ ...data.course, id: courseId }))
      console.log('Course stored. Data length:', localStorage.getItem('generatedCourse')?.length)
      
      // Navigate to the generated course page using MongoDB ID when available
      const fallbackId = topic.toLowerCase().replace(/\s+/g, '-')
      const targetId = courseId || fallbackId
      console.log('Navigating to:', `/course-generated/${targetId}`)
      router.push(`/course-generated/${targetId}`)
    } catch (error) {
      console.error('Course generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate course. Please try again.'
      setGenerateError(errorMessage)
      setIsGenerating(false)
    }
  }

  const progressPercentage = (currentStep / totalSteps) * 100

  // Review Page
  if (showReview) {
    const getAnswerDisplay = (questionId: number) => {
      const answer = answers[questionId]
      if (Array.isArray(answer)) {
        return answer.join(', ')
      }
      return answer || 'Not answered'
    }

    const goal = getAnswerDisplay(2)
    const experience = getAnswerDisplay(3)
    const timeCommitment = getAnswerDisplay(4)
    const learningStyle = getAnswerDisplay(5)
    const timeline = getAnswerDisplay(6)
    const interests = getAnswerDisplay(7)
    const preference = getAnswerDisplay(8)
    const tracking = getAnswerDisplay(9)
    const specificFocus = getAnswerDisplay(10)

    return (
      <div className="min-h-screen bg-white">
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
          <div className="container-custom py-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        step === 3 ? 'bg-gray-900 text-white' : step < 3 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {step}
                      </div>
                      <span className="text-xs mt-2 text-gray-600">
                        {step === 1 && 'start'}
                        {step === 2 && 'understanding you'}
                        {step === 3 && 'review'}
                        {step === 4 && 'course created'}
                      </span>
                    </div>
                    {step < 4 && (
                      <div className="flex-1 h-1 mx-4 bg-gray-200 rounded">
                        <div className="h-full bg-gray-900 rounded transition-all duration-300"
                          style={{ width: step < 3 ? '100%' : '0%' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-32 pb-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-normal text-gray-800 mb-12 leading-relaxed">
              Here's what I've understood about you so far, {userName.toLowerCase()}, to design a {topic.toLowerCase()} course that really fits you.
            </h1>

            {/* Conversational Review */}
            <div className="space-y-8 text-gray-700 leading-relaxed">
              {/* 1. Identity and Background */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">1. Your Identity and Background</h3>
                <div className="space-y-2 ml-6">
                  <p className="text-gray-700">Your name is {userName.toLowerCase()}.</p>
                  <p className="text-gray-700">You are learning {topic.toLowerCase()} with experience level: <span className="font-medium">{experience.toLowerCase()}</span>.</p>
                  {experience.toLowerCase().includes('beginner') && (
                    <>
                      <p className="text-gray-700 mt-3">Since you're new to {topic.toLowerCase()}, we'll start from the basics:</p>
                      <div className="ml-4 space-y-1">
                        <p className="text-gray-600">• Fundamental concepts</p>
                        <p className="text-gray-600">• Core principles</p>
                        <p className="text-gray-600">• Building blocks</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 2. Main Goals */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">2. Your Main Goals with {topic.toLowerCase()}</h3>
                <div className="space-y-2 ml-6">
                  <p className="text-gray-700">Your current goal is: <span className="font-medium">{goal.toLowerCase()}</span>.</p>
                  {goal.toLowerCase().includes('strong fundamentals') && (
                    <>
                      <p className="text-gray-700 mt-3">You want to build a strong foundation in {topic.toLowerCase()} first.</p>
                      <p className="text-gray-700">You want to reach a solid understanding level, which means:</p>
                      <div className="ml-4 space-y-1">
                        <p className="text-gray-600">• Mastering beginner to intermediate topics</p>
                        <p className="text-gray-600">• Understanding core concepts deeply</p>
                        <p className="text-gray-600">• Being able to apply knowledge practically</p>
                      </div>
                    </>
                  )}
                  {goal.toLowerCase().includes('interview') && (
                    <p className="text-gray-700 mt-3">Interview preparation is your focus, so we'll emphasize problem-solving patterns.</p>
                  )}
                </div>
              </div>

              {/* 3. Learning Style */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">3. Your Learning Style</h3>
                <div className="space-y-2 ml-6">
                  <p className="text-gray-700">Your preferred learning style: <span className="font-medium">{learningStyle.toLowerCase()}</span>.</p>
                  {learningStyle.toLowerCase().includes('visual') && (
                    <>
                      <p className="text-gray-700 mt-3">You like visuals and analogies to understand concepts.</p>
                      <div className="ml-4 space-y-1">
                        <p className="text-gray-600">• First understand the concept intuitively</p>
                        <p className="text-gray-600">• See diagrams, mental pictures, or everyday analogies</p>
                        <p className="text-gray-600">• Then move to code and implementation</p>
                      </div>
                      <p className="text-gray-700 mt-2">You prefer not to start with heavy, dry theory.</p>
                    </>
                  )}
                  {learningStyle.toLowerCase().includes('practical') && (
                    <p className="text-gray-700 mt-3">You prefer hands-on exercises and real coding practice.</p>
                  )}
                  {learningStyle.toLowerCase().includes('mixed') && (
                    <p className="text-gray-700 mt-3">You enjoy a combination of visual aids, practical exercises, and written explanations.</p>
                  )}
                </div>
              </div>

              {/* 4. Time Commitment */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">4. Your Time Commitment</h3>
                <div className="space-y-2 ml-6">
                  <p className="text-gray-700">You can dedicate <span className="font-medium">{timeCommitment.toLowerCase()}</span> to learning {topic.toLowerCase()}.</p>
                  <p className="text-gray-700">This is enough to make steady and serious progress.</p>
                  <p className="text-gray-700">We can design weekly goals with consistent effort in mind.</p>
                  <p className="text-gray-700">We'll structure the course to be completed in: <span className="font-medium">{timeline.toLowerCase()}</span>.</p>
                </div>
              </div>

              {/* 5. Areas of Interest */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">5. Your Areas of Interest</h3>
                <div className="space-y-2 ml-6">
                  <p className="text-gray-700">You're interested in: <span className="font-medium">{interests.toLowerCase()}</span>.</p>
                  <p className="text-gray-700">We'll focus on these areas throughout the course.</p>
                </div>
              </div>

              {/* 6. Learning Preference */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">6. Your Learning Preference</h3>
                <div className="space-y-2 ml-6">
                  <p className="text-gray-700">You prefer: <span className="font-medium">{preference.toLowerCase()}</span>.</p>
                  {preference.toLowerCase().includes('real-world') && (
                    <p className="text-gray-700">We'll include practical, real-world projects throughout.</p>
                  )}
                  {preference.toLowerCase().includes('mix') && (
                    <p className="text-gray-700">We'll balance theoretical foundations with practical applications.</p>
                  )}
                </div>
              </div>

              {/* 7. Progress Tracking */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">7. Progress Tracking</h3>
                <div className="space-y-2 ml-6">
                  <p className="text-gray-700">You want to track progress with: <span className="font-medium">{tracking.toLowerCase()}</span>.</p>
                  <p className="text-gray-700">We'll incorporate these throughout the course.</p>
                </div>
              </div>

              {/* 8. Specific Focus */}
              {specificFocus && specificFocus !== 'Not answered' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">8. Specific Focus</h3>
                  <div className="space-y-2 ml-6">
                    <p className="text-gray-700">You mentioned: <span className="font-medium">{specificFocus.toLowerCase()}</span>.</p>
                    <p className="text-gray-700">We'll make sure to address this in your personalized course.</p>
                  </div>
                </div>
              )}

              {/* Course Plan Summary */}
              <div className="pt-8 border-t border-gray-200">
                <p className="text-gray-800 leading-relaxed">
                  This is the picture I have of you now as a learner. Next, I can turn this understanding into a step-by-step, 
                  weekly {topic.toLowerCase()} plan tailored to your learning style.
                </p>
              </div>

              <div className="pt-4">
                <p className="text-gray-600 italic">
                  If anything above feels inaccurate, or if you want to adjust your goals or style, let me know and I'll adapt it.
                </p>
              </div>
            </div>

            {/* Error Display */}
            {generateError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Error Generating Course</h3>
                <p className="text-red-700">{generateError}</p>
                <p className="text-red-600 text-sm mt-3">
                  Tips: Check your internet connection, ensure the API key is valid, or try again in a few moments.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-12">
              <button
                onClick={() => {
                  setShowReview(false)
                  setCurrentStep(1)
                  setAnswers({})
                  setGenerateError(null)
                }}
                className="px-8 py-3 border-2 border-gray-300 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={generateCourse}
                disabled={isGenerating}
                className="px-8 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-full font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Course
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Creating Your Personalized Course</h2>
          <p className="text-lg text-gray-600 mb-8">
            We're designing a learning path just for you...
          </p>
          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-[loading_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    )
  }

  // Loading questions
  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Preparing Questions</h2>
          <p className="text-gray-600">
            Generating personalized questions for {topic}...
          </p>
        </div>
      </div>
    )
  }

  // Error loading questions
  if (questionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{questionError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full font-medium transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  // Check if questions are loaded
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="container-custom py-6">
          <div className="max-w-4xl mx-auto">
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        currentStep >= step * 2.5
                          ? 'bg-gray-900 text-white'
                          : currentStep >= (step - 1) * 2.5 + 1
                          ? 'bg-gray-400 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {step}
                    </div>
                    <span className="text-xs mt-2 text-gray-600">
                      {step === 1 && 'Start'}
                      {step === 2 && 'Understanding You'}
                      {step === 3 && 'Review'}
                      {step === 4 && 'Course Created'}
                    </span>
                  </div>
                  {step < 4 && (
                    <div className="flex-1 h-1 mx-4 bg-gray-200 rounded">
                      <div
                        className="h-full bg-gray-900 rounded transition-all duration-300"
                        style={{ width: currentStep > step * 2.5 ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="pt-52 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-lg md:text-xl font-normal text-gray-700 mb-10 leading-relaxed">
            {replaceTokens(currentQuestion.question)}
          </h1>

          {/* Text Input */}
          {currentQuestion.type === 'text' && (
            <div>
              <div className="relative mb-6">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                  placeholder={currentQuestion.placeholder}
                  className="w-full px-6 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 transition-colors"
                  autoFocus
                />
                <button
                  onClick={handleNext}
                  disabled={!textInput.trim() && currentStep !== totalSteps}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all ${
                    textInput.trim() || currentStep === totalSteps
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
              {currentStep === totalSteps && (
                <p className="text-sm text-gray-500 text-center">
                  This question is optional. Click the arrow to continue.
                </p>
              )}
            </div>
          )}

          {/* Single Choice Options */}
          {currentQuestion.type === 'single-choice' && (
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full text-left px-6 py-3.5 text-base rounded-xl border-2 transition-all ${
                    answers[currentStep] === option
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Multiple Choice Options */}
          {currentQuestion.type === 'multiple-choice' && (
            <div>
              <div className="space-y-3 mb-6">
                {currentQuestion.options?.map((option, index) => {
                  const isSelected = ((answers[currentStep] as string[]) || []).includes(option)
                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      className={`w-full text-left px-6 py-3.5 text-base rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        {option}
                      </div>
                    </button>
                  )
                })}
              </div>
              <button
                onClick={handleMultipleChoiceNext}
                disabled={!answers[currentStep] || (answers[currentStep] as string[])?.length === 0}
                className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
                  answers[currentStep] && (answers[currentStep] as string[])?.length > 0
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          )}

          {/* Back Button */}
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="mt-6 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Go back
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0%, 100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(400%);
          }
        }
      `}</style>
    </div>
  )
}
