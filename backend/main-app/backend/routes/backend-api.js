// Backend API utility functions for frontend to call backend endpoints
// This file can be used as a reference for frontend API calls

const API_BASE = 'http://localhost:5000/api';

export const backendAPI = {
  // ============ ENROLLMENT ENDPOINTS ============
  
  // Enroll in a course
  enrollCourse: async (courseData) => {
    try {
      const response = await fetch(`${API_BASE}/profile/enroll/course`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies
        body: JSON.stringify(courseData)
      });
      
      if (!response.ok) throw new Error('Failed to enroll in course');
      return await response.json();
    } catch (error) {
      console.error('Enrollment error:', error);
      throw error;
    }
  },

  // Enroll in a roadmap
  enrollRoadmap: async (roadmapData) => {
    try {
      const response = await fetch(`${API_BASE}/profile/enroll/roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(roadmapData)
      });
      
      if (!response.ok) throw new Error('Failed to enroll in roadmap');
      return await response.json();
    } catch (error) {
      console.error('Roadmap enrollment error:', error);
      throw error;
    }
  },

  // ============ PROGRESS UPDATE ENDPOINTS ============

  // Update course progress
  updateCourseProgress: async (enrollmentId, progressData) => {
    try {
      const response = await fetch(`${API_BASE}/profile/progress/course/${enrollmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(progressData)
      });
      
      if (!response.ok) throw new Error('Failed to update course progress');
      return await response.json();
    } catch (error) {
      console.error('Course progress update error:', error);
      throw error;
    }
  },

  // Update roadmap progress
  updateRoadmapProgress: async (enrollmentId, progressData) => {
    try {
      const response = await fetch(`${API_BASE}/profile/progress/roadmap/${enrollmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(progressData)
      });
      
      if (!response.ok) throw new Error('Failed to update roadmap progress');
      return await response.json();
    } catch (error) {
      console.error('Roadmap progress update error:', error);
      throw error;
    }
  },

  // ============ EVALUATION ENDPOINTS ============

  // Submit evaluation/test results
  submitEvaluation: async (evaluationData) => {
    try {
      const response = await fetch(`${API_BASE}/profile/evaluation/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(evaluationData)
      });
      
      if (!response.ok) throw new Error('Failed to submit evaluation');
      return await response.json();
    } catch (error) {
      console.error('Evaluation submission error:', error);
      throw error;
    }
  },

  // ============ PROFILE FETCH ENDPOINTS ============

  // Get user profile (courses, roadmaps, evaluations)
  getProfile: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch profile');
      return await response.json();
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  },

  // ============ COURSE DETAILS ENDPOINTS ============

  // Get user's enrolled courses
  getEnrolledCourses: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/profile/${userId}?type=courses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch courses');
      return await response.json();
    } catch (error) {
      console.error('Courses fetch error:', error);
      throw error;
    }
  },

  // Get user's roadmaps
  getRoadmaps: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/profile/${userId}?type=roadmaps`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch roadmaps');
      return await response.json();
    } catch (error) {
      console.error('Roadmaps fetch error:', error);
      throw error;
    }
  },

  // Get user's evaluations
  getEvaluations: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/profile/${userId}?type=evaluations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch evaluations');
      return await response.json();
    } catch (error) {
      console.error('Evaluations fetch error:', error);
      throw error;
    }
  }
};

export default backendAPI;
