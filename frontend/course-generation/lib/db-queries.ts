// Database functions for course-generation app
// Calls MongoDB backend API for real data persistence

const BACKEND_API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

export async function saveGeneratedCourse(course: any, userId?: string) {
  console.log('Saving course to MongoDB:', course.title)
  
  try {
    // Get user from localStorage - check multiple keys for compatibility
    let user = null
    const userStr = typeof window !== 'undefined' ? (
      localStorage.getItem('careersync_user') || 
      localStorage.getItem('careeros_user')
    ) : null
    
    if (userStr) {
      try {
        user = JSON.parse(userStr)
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
    
    let userEmail = user?.email || user?.userEmail
    let extractedUserId = user?.id || user?._id || user?.user_id || userId
    
    // CRITICAL: If we still don't have user info, fetch from backend using token
    if (!userEmail || !extractedUserId || extractedUserId === 'guest') {
      console.log('⚠️ User info incomplete, fetching from backend...')
      try {
        // Use standardized token key
        const tokenStr = localStorage.getItem('careersync_token')
        
        if (tokenStr) {
          console.log('📍 Found token:', tokenStr.substring(0, 20) + '...')
          const meResponse = await fetch(`${BACKEND_API}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${tokenStr}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          })
          if (meResponse.ok) {
            const meData = await meResponse.json()
            console.log('✅ Backend response:', meData)
            if (meData.user) {
              userEmail = meData.user.email
              extractedUserId = meData.user.id || meData.user._id
              console.log('✅ Fetched from backend - email:', userEmail, 'id:', extractedUserId)
              // Update localStorage for future use
              localStorage.setItem('careersync_user', JSON.stringify(meData.user))
            } else if (meData.id) {
              // Direct user data in response
              userEmail = meData.email
              extractedUserId = meData.id
              console.log('✅ Got direct user from backend - email:', userEmail, 'id:', extractedUserId)
              localStorage.setItem('careersync_user', JSON.stringify(meData))
            }
          } else {
            console.log('❌ Backend returned:', meResponse.status, meResponse.statusText)
          }
        } else {
          console.log('❌ No token found in localStorage')
        }
      } catch (fetchErr) {
        console.log('Could not fetch from backend:', fetchErr)
      }
    }
    
    console.log('📧 User email for course:', userEmail)
    console.log('👤 User ID for course:', extractedUserId)
    
    // FINAL VALIDATION BEFORE SENDING
    console.log('\n🚨 VALIDATION CHECK:')
    console.log('   ✓ Has userEmail?', !!userEmail, '(value:', userEmail, ')')
    console.log('   ✓ Has extractedUserId?', !!extractedUserId, '(value:', extractedUserId, ')')
    console.log('   ✓ extractedUserId !== "guest"?', extractedUserId !== 'guest')
    
    const requestBody = {
      userId: extractedUserId || 'guest',
      userEmail: userEmail || null,
      title: course.title,
      description: course.description,
      level: course.difficulty || course.level,
      duration: course.duration,
      modules: course.modules,
      objectives: course.objectives,
      course: course
    }
    
    console.log('📤 SENDING TO BACKEND:')
    console.log(JSON.stringify(requestBody, null, 2))
    
    const response = await fetch(`${BACKEND_API}/courses/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Course saved to MongoDB:', data.courseId)
      return { courseId: data.courseId }
    } else {
      throw new Error(data.error || 'Failed to save course')
    }
  } catch (error) {
    console.error('❌ Error saving course to MongoDB:', error)
    throw error
  }
}

export async function createRoadmap(roadmap: any, userId?: string) {
  console.log('Creating roadmap with mock implementation:', roadmap.title)
  
  const roadmapId = `roadmap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const roadmapData = {
    ...roadmap,
    id: roadmapId,
    userId: userId || 'guest',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  console.log('Mock roadmap created:', roadmapData)
  return { roadmapId }
}

export async function getRoadmapDeep(roadmapId: string) {
  console.log('Getting roadmap with mock implementation:', roadmapId)
  
  // Return a mock roadmap structure
  return {
    id: roadmapId,
    title: 'Sample Roadmap',
    description: 'A sample learning roadmap',
    stages: [],
    createdAt: new Date().toISOString(),
  }
}
