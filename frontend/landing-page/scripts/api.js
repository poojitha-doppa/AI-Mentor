// API client for MongoDB backend
const API_BASE_URL = 'http://localhost:5000/api'

export const api = {
  // Auth
  async signUp(email, password, name) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    return response.json()
  },

  async signIn(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return response.json()
  },

  async signOut() {
    localStorage.removeItem('careersync_token')
    localStorage.removeItem('careersync_user')
    localStorage.removeItem('careersync_auth')
    return { success: true }
  },

  // Courses
  async getCourses(userId) {
    const token = localStorage.getItem('careersync_token')
    const url = userId ? `${API_BASE_URL}/courses?userId=${userId}` : `${API_BASE_URL}/courses`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    return response.json()
  },

  async createCourse(courseData) {
    const token = localStorage.getItem('careersync_token')
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(courseData),
    })
    return response.json()
  },

  // Roadmaps
  async getRoadmaps(userId) {
    const token = localStorage.getItem('careersync_token')
    const url = userId ? `${API_BASE_URL}/roadmaps?userId=${userId}` : `${API_BASE_URL}/roadmaps`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    return response.json()
  },

  async createRoadmap(roadmapData) {
    const token = localStorage.getItem('careersync_token')
    const response = await fetch(`${API_BASE_URL}/roadmaps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(roadmapData),
    })
    return response.json()
  },

  // Skills
  async getSkills() {
    const token = localStorage.getItem('careersync_token')
    const response = await fetch(`${API_BASE_URL}/skills`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    return response.json()
  },

  async evaluateSkill(skillData) {
    const token = localStorage.getItem('careersync_token')
    const response = await fetch(`${API_BASE_URL}/skills/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(skillData),
    })
    return response.json()
  },
}

export default api

