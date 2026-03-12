'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Target, CheckCircle, Download } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

interface Module {
  id: number
  title: string
  duration: string
  description: string
  topics: string[]
  activities: string[]
  project?: string
  assessment?: string
  readingMaterials?: Array<{
    title: string
    source: string
    url: string
    difficulty?: string
    estimatedReadTime?: string
  }>
}

interface Resource {
  type: string
  title: string
  description: string
  url?: string
}

interface Course {
  title: string
  description: string
  duration?: string
  difficulty?: string
  prerequisites?: string[]
  objectives?: string[]
  modules?: Module[]
  resources?: Resource[]
  finalProject?: {
    title: string
    description: string
    deliverables?: string[]
  }
  rawContent?: string
}

export default function GeneratedCoursePage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Helper function to ensure reading materials exist
  const ensureReadingMaterials = (modules: Module[]): Module[] => {
    return modules.map((module, idx) => {
      if (!module.readingMaterials || module.readingMaterials.length === 0) {
        const moduleTopic = module.title.replace('Module ', '').replace(/^\d+:\s*/, '')
        return {
          ...module,
          readingMaterials: [
            {
              title: `GeeksforGeeks - ${moduleTopic}`,
              source: 'GeeksforGeeks',
              url: `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(moduleTopic)}`,
              difficulty: 'beginner',
              estimatedReadTime: idx < 3 ? '20 mins' : '30 mins',
            },
            {
              title: `${moduleTopic} - Official Documentation`,
              source: 'Official Documentation',
              url: `https://docs.example.com/${moduleTopic.toLowerCase().replace(/\s+/g, '-')}`,
              difficulty: 'intermediate',
              estimatedReadTime: '25 mins',
            },
            {
              title: `${moduleTopic} Tutorial - Medium`,
              source: 'Medium',
              url: `https://medium.com/search?q=${encodeURIComponent(moduleTopic)}`,
              difficulty: 'beginner',
              estimatedReadTime: '15 mins',
            },
            {
              title: `${moduleTopic} Guide - Dev.to`,
              source: 'Dev.to',
              url: `https://dev.to/search?q=${encodeURIComponent(moduleTopic)}`,
              difficulty: 'intermediate',
              estimatedReadTime: '20 mins',
            },
          ]
        }
      }
      return module
    })
  }

  // Track course enrollment (NOTE: This was using wrong localStorage key and wrong endpoint)
  // Commenting this out - handleSaveCourse is the proper way to save courses
  const trackCourseEnrollment = async (courseData: any) => {
    // This function is intentionally disabled because it was using:
    // 1. Wrong localStorage key: 'careeros_user' instead of 'careersync_user'
    // 2. Wrong endpoint: '/api/profile/enroll/course' instead of '/api/courses/save'
    // The proper way to save courses is via handleSaveCourse() which is called by user action
    console.log('📚 Course loaded (ready for manual save):', courseData.title)
  }

  useEffect(() => {
    const loadCourse = async () => {
      console.log('Loading course from localStorage...')
      const courseData = typeof window !== 'undefined' ? localStorage.getItem('generatedCourse') : null
      if (courseData) {
        try {
          let parsedCourse = JSON.parse(courseData)
          if (parsedCourse && parsedCourse.title) {
            // Ensure all modules have reading materials
            if (parsedCourse.modules) {
              parsedCourse.modules = ensureReadingMaterials(parsedCourse.modules)
            }
            console.log('📚 Course loaded. Modules:', parsedCourse.modules?.length)
            console.log('📚 First module has reading materials:', !!parsedCourse.modules?.[0]?.readingMaterials)
            console.log('📚 Reading materials count:', parsedCourse.modules?.[0]?.readingMaterials?.length || 0)
            setCourse(parsedCourse)
            trackCourseEnrollment(parsedCourse)
            setLoading(false)
            return
          }
        } catch (error) {
          console.error('Error parsing course data:', error)
        }
      }

      // Fallback: Try loading from MongoDB backend using API
      try {
        const courseId = params.id as string
        const courseResponse = await api.getCourse(courseId)
        
        if (courseResponse && courseResponse.data) {
          const dbCourse = courseResponse.data
          
          const modules = (dbCourse.modules || []).map((module: any, idx: number) => ({
            id: idx + 1,
            title: module.title || `Module ${idx + 1}`,
            duration: module.duration || '1 week',
            description: module.description || '',
            topics: module.topics || [],
            activities: module.activities || [],
            project: module.project,
            assessment: module.assessment,
            readingMaterials: module.readingMaterials || [],
          }))

          const assembled: Course = {
            title: dbCourse.title,
            description: dbCourse.description,
            difficulty: dbCourse.level || dbCourse.difficulty,
            duration: dbCourse.duration,
            modules: ensureReadingMaterials(modules),
            resources: dbCourse.resources || [],
          }

          setCourse(assembled)
        }
      } catch (apiError) {
        console.error('API load failure:', apiError)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(loadCourse, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSaveCourse = async () => {
    if (!course) return

    setSaving(true)
    try {
      // Extract user data from localStorage
      const userStr = localStorage.getItem('careersync_user')
      let userId = null
      let userEmail = null
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          userId = user._id || user.id || user.id
          userEmail = user.email
          console.log('✅ Got user from localStorage:', { userId, userEmail })
        } catch (e) {
          console.error('Failed to parse user:', e)
        }
      }

      // If still no user, try to fetch from backend
      if (!userId || !userEmail) {
        console.log('⚠️ User data incomplete, trying to fetch from backend...')
        try {
          const token = localStorage.getItem('careersync_token')
          if (token) {
            const response = await fetch('http://localhost:5000/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              credentials: 'include'
            })
            if (response.ok) {
              const data = await response.json()
              userId = data.user?.id || data.id
              userEmail = data.user?.email || data.email
              console.log('✅ Fetched from backend:', { userId, userEmail })
              // Save to localStorage for future use
              localStorage.setItem('careersync_user', JSON.stringify(data.user || data))
            }
          }
        } catch (err) {
          console.log('Could not fetch from backend:', err)
        }
      }

      console.log('\n📤 SAVING COURSE WITH:')
      console.log('   userId:', userId)
      console.log('   userEmail:', userEmail)
      console.log('   title:', course.title)

      // Send to backend courses/save endpoint (NOT enrollment!)
      const saveResponse = await fetch('http://localhost:5000/api/courses/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: userId || 'guest',
          userEmail: userEmail || null,
          title: course.title,
          description: course.description,
          level: course.difficulty || 'Intermediate',
          duration: course.duration || '4 weeks',
          modules: course.modules || [],
          objectives: course.objectives || [],
          resources: course.resources || [],
          course: course
        })
      })

      const saveData = await saveResponse.json()
      console.log('Backend response:', saveData)

      if (!saveResponse.ok) {
        throw new Error(saveData.error || 'Failed to save course')
      }

      console.log('✅ Course saved successfully!')
      setSaved(true)
      alert('✅ Course saved successfully! You can now access it from your profile.')
      
      // Redirect to profile after delay
      setTimeout(() => {
        const landingUrl = (window as any).getModuleUrls ? (window as any).getModuleUrls().landing : (window.location.hostname.includes('onrender.com') ? 'https://careersync-landing-oldo.onrender.com' : 'http://localhost:4173');
        window.location.href = landingUrl + '/profile.html'
      }, 2000)
    } catch (error) {
      console.error('❌ Error saving course:', error)
      alert(error instanceof Error ? error.message : 'Failed to save course. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          {/* Animated spinner */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin"></div>
            </div>
          </div>
          
          {/* Text */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating Your Course</h2>
          <p className="text-lg text-gray-600 mb-2">We're personalizing your learning experience...</p>
          <p className="text-sm text-gray-500">This will only take a moment</p>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Course Could Not Load</h2>
          <p className="text-gray-600 mb-6">
            It looks like the course data didn't transfer properly. This can happen if you navigated directly to this page or if there was a connection issue.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                // Try to refresh
                window.location.reload()
              }}
              className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
            <Link 
              href="/home" 
              className="block px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
            >
              Go Back to Home
            </Link>
          </div>
          
          <p className="text-xs text-gray-500 mt-6">
            Tip: Generate a new course from the home page and the course will load automatically.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <Link
            href="/home"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-8 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-0 leading-tight tracking-tight">
            {course.title}
          </h1>
        </div>
      </div>

      {/* Topics Section */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-[0.15em]">TOPICS</h2>
          <div className="flex items-center gap-3">
            <button className="text-sm text-gray-700 hover:text-gray-900 px-4 py-2 border border-gray-200 rounded-lg transition-colors">
              See course design
            </button>
            <button className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-6">
          {course.modules && course.modules.length > 0 ? (
            <>
              <div className="mb-8">
                <p className="text-gray-600 text-lg">
                  This course is divided into <span className="font-bold text-gray-900">{course.modules.length} comprehensive modules</span>, each designed to progressively build your skills.
                </p>
              </div>
              
              {course.modules.map((module, index) => (
                <div key={module.id} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                  {/* Module Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <span className="inline-block text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-1 bg-white rounded-full border border-gray-200 mb-3">
                          Module {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                          {module.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Module Description */}
                  <p className="text-[15px] text-gray-700 leading-relaxed mb-6 ml-16">
                    {module.description}
                  </p>

                  {/* Module Details Grid */}
                  <div className="ml-16 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Topics */}
                    {module.topics && module.topics.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Topics Covered</h4>
                        <ul className="space-y-2">
                          {module.topics.map((topic, idx) => (
                            <li key={idx} className="text-[14px] text-gray-700 flex items-start">
                              <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mt-2 mr-3 flex-shrink-0"></span>
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Activities */}
                    {module.activities && module.activities.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Activities & Exercises</h4>
                        <ul className="space-y-2">
                          {module.activities.map((activity, idx) => (
                            <li key={idx} className="text-[14px] text-gray-700 flex items-start">
                              <span className="inline-block w-2 h-2 rounded-full bg-green-600 mt-2 mr-3 flex-shrink-0"></span>
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Module Project */}
                  {module.project && (
                    <div className="ml-16 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Module Project
                      </h4>
                      <p className="text-[14px] text-blue-800">{module.project}</p>
                    </div>
                  )}

                  {/* Start Button */}
                  <div className="ml-16">
                    <button 
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[14px] px-6 py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                      onClick={() => {
                        // Ensure courseId is a string, not an array
                        const courseIdValue = Array.isArray(params.id) ? params.id[0] : params.id
                        
                        const moduleData = {
                          ...module,
                          courseTitle: course.title,
                          moduleIndex: index,
                          courseId: courseIdValue
                        }
                        
                        console.log('💾 Storing module data:', {
                          moduleNumber: index + 1,
                          courseId: courseIdValue,
                          moduleTitle: module.title,
                          hasReadingMaterials: !!module.readingMaterials,
                          readingMaterialsCount: module.readingMaterials?.length || 0
                        })
                        
                        localStorage.setItem(`module_${index + 1}`, JSON.stringify(moduleData))
                        
                        const courseSlug = course.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                        console.log('🚀 Navigating to topic:', `/course/${courseSlug}/topic/${index + 1}`)
                        router.push(`/course/${courseSlug}/topic/${index + 1}`)
                      }}
                    >
                      Start Module
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            // Fallback for courses without structured modules
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-10">
              <div className="mb-5">
                <span className="inline-block text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-1.5 bg-white rounded-full border border-gray-200">
                  COURSE CONTENT
                </span>
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 mb-5 tracking-tight leading-tight">
                {course.title}
              </h3>
              
              <div className="prose max-w-none text-[15px] text-gray-600 leading-relaxed mb-8 whitespace-pre-wrap">
                {course.rawContent || course.description}
              </div>
              
              <button 
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[14px] px-6 py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() => {
                  // Ensure courseId is a string, not an array
                  const courseIdValue = Array.isArray(params.id) ? params.id[0] : params.id
                  
                  const moduleData = {
                    title: course.title,
                    description: course.description,
                    content: course.rawContent || course.description,
                    courseTitle: course.title,
                    moduleIndex: 0,
                    courseId: courseIdValue
                  }
                  
                  console.log('💾 Storing fallback module data:', {
                    moduleNumber: 1,
                    courseId: courseIdValue,
                    courseTitle: course.title
                  })
                  
                  localStorage.setItem('module_1', JSON.stringify(moduleData))
                  const courseSlug = course.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                  console.log('🚀 Navigating to topic:', `/course/${courseSlug}/topic/1`)
                  router.push(`/course/${courseSlug}/topic/1`)
                }}
              >
                Start Course
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Additional Course Info */}
        {(course.objectives || course.prerequisites || course.resources) && (
          <div className="mt-12 pt-12 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Learning Objectives */}
              {course.objectives && course.objectives.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">LEARNING OBJECTIVES</h3>
                  <ul className="space-y-3">
                    {course.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prerequisites */}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">PREREQUISITES</h3>
                  <ul className="space-y-2">
                    {course.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span className="text-gray-700">{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Resources */}
            {course.resources && course.resources.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">📚 COMPLETE LEARNING RESOURCES</h3>
                <p className="text-xs text-gray-500 mb-6">Direct links to comprehensive documentation, courses, and learning materials for this topic</p>
                <div className="space-y-2">
                  {course.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xs text-blue-600 uppercase font-semibold bg-blue-50 px-2 py-1 rounded whitespace-nowrap">{resource.type}</span>
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">{resource.title}</h4>
                      </div>
                      <svg className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-12 flex flex-wrap gap-4">
          {!saved && (
            <button
              onClick={handleSaveCourse}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save to My Courses'}
            </button>
          )}
          {saved && (
            <button
              disabled
              className="flex items-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg font-medium"
            >
              <CheckCircle className="w-5 h-5" />
              Saved
            </button>
          )}
          <button
            onClick={() => {
              const dataStr = JSON.stringify(course, null, 2)
              const dataBlob = new Blob([dataStr], { type: 'application/json' })
              const url = URL.createObjectURL(dataBlob)
              const link = document.createElement('a')
              link.href = url
              link.download = `${course.title.replace(/\s+/g, '_')}_curriculum.json`
              link.click()
            }}
            className="flex items-center gap-2 text-gray-700 border border-gray-300 hover:bg-gray-50 py-3 px-6 rounded-lg font-medium transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Course
          </button>
          <button
            onClick={() => router.push('/home')}
            className="text-gray-700 hover:text-gray-900 py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Create Another Course
          </button>
        </div>
      </div>
    </div>
  )
}
