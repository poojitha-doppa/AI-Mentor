// careersync Profile Utilities - Enhanced with Backend Integration
// Helper functions to track courses, roadmaps, and evaluations progress
// All operations sync with backend database

const API_BASE = (typeof window.getModuleUrls === 'function')
    ? window.getModuleUrls().backend + '/api'
    : (window.location.hostname.includes('onrender.com')
        ? 'https://careersync-backend-oldo.onrender.com/api'
        : 'http://localhost:5000/api');

// Helper to get user ID from localStorage
function getUserId() {
    const user = JSON.parse(localStorage.getItem('careersync_user') || '{}');
    return user._id || user.id || localStorage.getItem('careersync_userId');
}

// Helper to get user email from localStorage
function getUserEmail() {
    const user = JSON.parse(localStorage.getItem('careersync_user') || '{}');
    return user.email || localStorage.getItem('careersync_userEmail');
}

// Save course to profile (backend + localStorage)
async function saveCourseToProfile(courseData) {
    const enrolledCourses = JSON.parse(localStorage.getItem('careersync_enrolled_courses') || '[]');
    
    const courseEntry = {
        id: courseData.id || courseData.courseId || Date.now().toString(),
        title: courseData.title || courseData.courseName,
        courseName: courseData.courseName || courseData.title,
        level: courseData.level || 'Intermediate',
        duration: courseData.duration || '4 weeks',
        modules: courseData.modules || courseData.totalModules || 10,
        totalModules: courseData.modules || courseData.totalModules || 10,
        completedModules: courseData.completedModules || 0,
        progress: courseData.progress || 0,
        enrolledAt: courseData.enrolledAt || new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        status: courseData.status || 'in-progress',
        curriculum: courseData.curriculum || null
    };
    
    // Check if course already exists
    const existingIndex = enrolledCourses.findIndex(c => c.id === courseEntry.id || c.title === courseEntry.title);
    
    if (existingIndex >= 0) {
        enrolledCourses[existingIndex] = { ...enrolledCourses[existingIndex], ...courseEntry };
    } else {
        enrolledCourses.push(courseEntry);
    }
    
    localStorage.setItem('careersync_enrolled_courses', JSON.stringify(enrolledCourses));
    console.log('Course saved to profile:', courseEntry.title);
    
    // Send to backend
    try {
        const userId = getUserId();
        const userEmail = getUserEmail();
        
        if (userId && userEmail) {
            const response = await fetch(`${API_BASE}/profile/enroll/course`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    userId,
                    userEmail,
                    courseId: courseEntry.id,
                    courseTitle: courseEntry.title,
                    courseModules: courseEntry.modules || []
                })
            });
            
            if (response.ok) {
                const backendResult = await response.json();
                courseEntry._id = backendResult._id; // Store backend ID
                enrolledCourses[existingIndex >= 0 ? existingIndex : enrolledCourses.length - 1] = courseEntry;
                localStorage.setItem('careersync_enrolled_courses', JSON.stringify(enrolledCourses));
                console.log('Course synced to backend');
                return backendResult;
            }
        }
    } catch (error) {
        console.error('Failed to sync course to backend:', error);
    }
    
    return courseEntry;
}

// Update course progress (backend + localStorage)
async function updateCourseProgress(courseId, progress, completedModules) {
    const enrolledCourses = JSON.parse(localStorage.getItem('careersync_enrolled_courses') || '[]');
    const courseIndex = enrolledCourses.findIndex(c => c.id === courseId || c.title === courseId);
    
    if (courseIndex >= 0) {
        enrolledCourses[courseIndex].progress = Math.min(100, Math.max(0, progress));
        enrolledCourses[courseIndex].completedModules = completedModules || 0;
        enrolledCourses[courseIndex].lastAccessedAt = new Date().toISOString();
        
        if (enrolledCourses[courseIndex].progress >= 100) {
            enrolledCourses[courseIndex].status = 'completed';
            enrolledCourses[courseIndex].completedAt = new Date().toISOString();
        }
        
        localStorage.setItem('careersync_enrolled_courses', JSON.stringify(enrolledCourses));
        console.log('Course progress updated:', progress + '%');
        
        // Send to backend
        try {
            const enrollmentId = enrolledCourses[courseIndex]._id;
            if (enrollmentId) {
                const response = await fetch(`${API_BASE}/profile/progress/course/${enrollmentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        progress: enrolledCourses[courseIndex].progress,
                        completed: enrolledCourses[courseIndex].progress >= 100,
                        completedModules: completedModules || []
                    })
                });
                
                if (response.ok) {
                    console.log('Course progress synced to backend');
                    return await response.json();
                }
            }
        } catch (error) {
            console.error('Failed to sync progress to backend:', error);
        }
        
        return enrolledCourses[courseIndex];
    }
    
    return null;
}

// Save roadmap to profile (backend + localStorage)
async function saveRoadmapToProfile(roadmapData) {
    const savedRoadmaps = JSON.parse(localStorage.getItem('careersync_saved_roadmaps') || '[]');
    
    const roadmapEntry = {
        id: roadmapData.id || roadmapData.roadmapId || Date.now().toString(),
        title: roadmapData.title || roadmapData.careerGoal,
        careerGoal: roadmapData.careerGoal || roadmapData.title,
        targetRole: roadmapData.targetRole || roadmapData.title,
        stages: roadmapData.stages || roadmapData.totalStages || 5,
        totalStages: roadmapData.stages || roadmapData.totalStages || 5,
        completedStages: roadmapData.completedStages || 0,
        progress: roadmapData.progress || 0,
        duration: roadmapData.duration || '6 months',
        createdAt: roadmapData.createdAt || new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        status: roadmapData.status || 'in-progress',
        roadmapData: roadmapData.roadmapData || null
    };
    
    // Check if roadmap already exists
    const existingIndex = savedRoadmaps.findIndex(r => r.id === roadmapEntry.id || r.title === roadmapEntry.title);
    
    if (existingIndex >= 0) {
        savedRoadmaps[existingIndex] = { ...savedRoadmaps[existingIndex], ...roadmapEntry };
    } else {
        savedRoadmaps.push(roadmapEntry);
    }
    
    localStorage.setItem('careersync_saved_roadmaps', JSON.stringify(savedRoadmaps));
    console.log('Roadmap saved to profile:', roadmapEntry.title);
    
    // Send to backend
    try {
        const userId = getUserId();
        const userEmail = getUserEmail();
        
        if (userId && userEmail) {
            const response = await fetch(`${API_BASE}/profile/enroll/roadmap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    userId,
                    userEmail,
                    roadmapId: roadmapEntry.id,
                    roadmapTitle: roadmapEntry.title,
                    roadmapStages: roadmapEntry.stages || []
                })
            });
            
            if (response.ok) {
                const backendResult = await response.json();
                roadmapEntry._id = backendResult._id;
                savedRoadmaps[existingIndex >= 0 ? existingIndex : savedRoadmaps.length - 1] = roadmapEntry;
                localStorage.setItem('careersync_saved_roadmaps', JSON.stringify(savedRoadmaps));
                console.log('Roadmap synced to backend');
                return backendResult;
            }
        }
    } catch (error) {
        console.error('Failed to sync roadmap to backend:', error);
    }
    
    return roadmapEntry;
}

// Update roadmap progress (backend + localStorage)
async function updateRoadmapProgress(roadmapId, progress, completedStages) {
    const savedRoadmaps = JSON.parse(localStorage.getItem('careersync_saved_roadmaps') || '[]');
    const roadmapIndex = savedRoadmaps.findIndex(r => r.id === roadmapId || r.title === roadmapId);
    
    if (roadmapIndex >= 0) {
        savedRoadmaps[roadmapIndex].progress = Math.min(100, Math.max(0, progress));
        savedRoadmaps[roadmapIndex].completedStages = completedStages || 0;
        savedRoadmaps[roadmapIndex].lastAccessedAt = new Date().toISOString();
        
        if (savedRoadmaps[roadmapIndex].progress >= 100) {
            savedRoadmaps[roadmapIndex].status = 'completed';
            savedRoadmaps[roadmapIndex].completedAt = new Date().toISOString();
        }
        
        localStorage.setItem('careersync_saved_roadmaps', JSON.stringify(savedRoadmaps));
        console.log('Roadmap progress updated:', progress + '%');
        
        // Send to backend
        try {
            const enrollmentId = savedRoadmaps[roadmapIndex]._id;
            if (enrollmentId) {
                const response = await fetch(`${API_BASE}/profile/progress/roadmap/${enrollmentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        progress: savedRoadmaps[roadmapIndex].progress,
                        completedStages: completedStages || []
                    })
                });
                
                if (response.ok) {
                    console.log('Roadmap progress synced to backend');
                    return await response.json();
                }
            }
        } catch (error) {
            console.error('Failed to sync progress to backend:', error);
        }
        
        return savedRoadmaps[roadmapIndex];
    }
    
    return null;
}

// Save skill evaluation to profile (backend + localStorage)
async function saveEvaluationToProfile(evaluationData) {
    const completedEvaluations = JSON.parse(localStorage.getItem('careersync_evaluations') || '[]');
    
    const evaluationEntry = {
        id: evaluationData.id || Date.now().toString(),
        topic: evaluationData.topic || evaluationData.title,
        title: evaluationData.title || evaluationData.topic,
        totalQuestions: evaluationData.totalQuestions || 10,
        correctAnswers: evaluationData.correctAnswers || 0,
        score: evaluationData.score || 0,
        completedAt: evaluationData.completedAt || new Date().toISOString(),
        createdAt: evaluationData.createdAt || new Date().toISOString(),
        timeTaken: evaluationData.timeTaken || '0 min',
        results: evaluationData.results || null
    };
    
    completedEvaluations.push(evaluationEntry);
    localStorage.setItem('careersync_evaluations', JSON.stringify(completedEvaluations));
    console.log('Evaluation saved to profile:', evaluationEntry.topic);
    
    // Send to backend
    try {
        const userId = getUserId();
        const userEmail = getUserEmail();
        
        if (userId && userEmail) {
            const response = await fetch(`${API_BASE}/profile/evaluation/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    userId,
                    userEmail,
                    evaluationTitle: evaluationEntry.title,
                    score: evaluationEntry.score,
                    totalQuestions: evaluationEntry.totalQuestions,
                    correctAnswers: evaluationEntry.correctAnswers,
                    timeTaken: evaluationEntry.timeTaken
                })
            });
            
            if (response.ok) {
                const backendResult = await response.json();
                evaluationEntry._id = backendResult._id;
                completedEvaluations[completedEvaluations.length - 1] = evaluationEntry;
                localStorage.setItem('careersync_evaluations', JSON.stringify(completedEvaluations));
                console.log('Evaluation synced to backend');
                return backendResult;
            }
        }
    } catch (error) {
        console.error('Failed to sync evaluation to backend:', error);
    }
    
    return evaluationEntry;
}

// Get all profile data (fetch from backend first, then fallback to localStorage)
async function getProfileData() {
    try {
        const userId = getUserId();
        
        if (userId) {
            const response = await fetch(`${API_BASE}/profile/${userId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            
            if (response.ok) {
                const backendData = await response.json();
                console.log('Profile data fetched from backend:', backendData);
                
                // Update localStorage with backend data
                if (backendData.courses) {
                    localStorage.setItem('careersync_enrolled_courses', JSON.stringify(backendData.courses));
                }
                if (backendData.roadmaps) {
                    localStorage.setItem('careersync_saved_roadmaps', JSON.stringify(backendData.roadmaps));
                }
                if (backendData.evaluations) {
                    localStorage.setItem('careersync_evaluations', JSON.stringify(backendData.evaluations));
                }
                
                return backendData;
            }
        }
    } catch (error) {
        console.error('Error fetching from backend, using localStorage:', error);
    }
    
    // Fallback to localStorage
    return {
        courses: JSON.parse(localStorage.getItem('careersync_enrolled_courses') || '[]'),
        roadmaps: JSON.parse(localStorage.getItem('careersync_saved_roadmaps') || '[]'),
        evaluations: JSON.parse(localStorage.getItem('careersync_evaluations') || '[]')
    };
}

// Export functions for use in other pages
if (typeof window !== 'undefined') {
    window.careersyncProfile = {
        saveCourse: saveCourseToProfile,
        updateCourseProgress: updateCourseProgress,
        saveRoadmap: saveRoadmapToProfile,
        updateRoadmapProgress: updateRoadmapProgress,
        saveEvaluation: saveEvaluationToProfile,
        getProfileData: getProfileData
    };
}

