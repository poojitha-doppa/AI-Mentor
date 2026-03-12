// lib/api.ts - MongoDB Atlas API client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const token = typeof window !== 'undefined' ? localStorage.getItem('careersync_token') : null

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'API request failed')
      }

      return data
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      throw error
    }
  }

  // Auth endpoints
  async signUp(email: string, password: string, name?: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
  }

  async signIn(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async signOut() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('careersync_token')
      localStorage.removeItem('careersync_user')
      localStorage.removeItem('careersync_auth')
    }
    return { success: true }
  }

  async getProfile() {
    return this.request('/auth/profile')
  }

  // Course endpoints
  async getCourses(userId?: string) {
    const query = userId ? `?userId=${userId}` : ''
    return this.request(`/courses${query}`)
  }

  async getCourse(courseId: string) {
    return this.request(`/courses/${courseId}`)
  }

  async createCourse(courseData: any) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    })
  }

  async updateCourse(courseId: string, courseData: any) {
    return this.request(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    })
  }

  async deleteCourse(courseId: string) {
    return this.request(`/courses/${courseId}`, {
      method: 'DELETE',
    })
  }

  async generateCourse(prompt: string, options: any = {}) {
    return this.request('/courses/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, ...options }),
    })
  }

  // Roadmap endpoints
  async getRoadmaps(userId?: string) {
    const query = userId ? `?userId=${userId}` : ''
    return this.request(`/roadmaps${query}`)
  }

  async createRoadmap(roadmapData: any) {
    return this.request('/roadmaps', {
      method: 'POST',
      body: JSON.stringify(roadmapData),
    })
  }

  // Skill evaluation endpoints
  async getSkills() {
    return this.request('/skills')
  }

  async evaluateSkill(skillData: any) {
    return this.request('/skills/evaluate', {
      method: 'POST',
      body: JSON.stringify(skillData),
    })
  }

  async getEvaluations(userId?: string) {
    const query = userId ? `?userId=${userId}` : ''
    return this.request(`/skills/evaluations${query}`)
  }
}

export const api = new ApiClient(API_BASE_URL)
export default api
