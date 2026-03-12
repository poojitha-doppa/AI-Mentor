// Course Generation Page - Database Integration Code
// Add this to your course generation page (http://localhost:3002)

// ============ IMPORTS ============
// Make sure to include the profile-utils.js from landing page
// Add this line to your HTML or import in your component:
// <script src="http://localhost:4173/profile-utils.js"></script>

// ============ COURSE ENROLLMENT HANDLER ============
// Call this function when user clicks "Start Course" or "Enroll" button

async function handleCourseEnrollment(courseData) {
    console.log('Enrolling in course:', courseData);
    
    try {
        // Data structure expected:
        const enrollmentData = {
            id: courseData.id || courseData.courseId || `course-${Date.now()}`,
            title: courseData.title || courseData.name,
            courseName: courseData.name || courseData.title,
            level: courseData.difficulty || 'Intermediate',
            duration: courseData.duration || '4 weeks',
            modules: courseData.modules?.length || courseData.totalModules || 10,
            totalModules: courseData.modules?.length || courseData.totalModules || 10,
            completedModules: 0,
            progress: 0,
            status: 'in-progress',
            curriculum: courseData.modules || courseData.curriculum || []
        };
        
        // Save to backend and localStorage
        const result = await careersyncProfile.saveCourse(enrollmentData);
        
        if (result) {
            console.log('Course enrollment successful:', result);
            
            // Store the enrollment ID for progress updates
            localStorage.setItem(`course_enrollment_${enrollmentData.id}`, JSON.stringify({
                enrollmentId: result._id,
                courseId: enrollmentData.id,
                totalModules: enrollmentData.totalModules
            }));
            
            // Show success message
            alert(`✓ Successfully enrolled in ${enrollmentData.title}`);
            
            // Optional: Redirect to course page or refresh UI
            // window.location.href = '/course/' + result._id;
        }
    } catch (error) {
        console.error('Enrollment failed:', error);
        alert('Failed to enroll in course. Please try again.');
    }
}

// ============ MODULE COMPLETION HANDLER ============
// Call this function when user completes a module

async function handleModuleCompletion(courseId, moduleIndex, totalModules) {
    console.log(`Module ${moduleIndex + 1}/${totalModules} completed for course ${courseId}`);
    
    try {
        // Get enrollment ID
        const enrollmentData = JSON.parse(
            localStorage.getItem(`course_enrollment_${courseId}`) || '{}'
        );
        
        if (!enrollmentData.enrollmentId) {
            console.error('Enrollment ID not found');
            return;
        }
        
        // Calculate progress
        const completedModules = moduleIndex + 1;
        const progress = (completedModules / totalModules) * 100;
        
        // Update backend
        const result = await careersyncProfile.updateCourseProgress(
            enrollmentData.enrollmentId,
            Math.round(progress),
            completedModules
        );
        
        console.log('Module progress updated:', result);
        
        // Show toast notification
        showToast(`Module ${completedModules}/${totalModules} Completed - ${Math.round(progress)}%`);
        
        // If course is complete
        if (progress >= 100) {
            showToast('✓ Course Completed! Check your profile.', 'success');
            setTimeout(() => {
                // Optional: Redirect to profile
                // window.open('http://localhost:4173/profile.html', '_blank');
            }, 2000);
        }
        
        return result;
    } catch (error) {
        console.error('Module completion update failed:', error);
        showToast('Failed to update progress', 'error');
    }
}

// ============ COMPLETE COURSE HANDLER ============
// Call this when user marks course as "complete" or "finished"

async function handleCourseCompletion(courseId) {
    console.log('Completing course:', courseId);
    
    try {
        const enrollmentData = JSON.parse(
            localStorage.getItem(`course_enrollment_${courseId}`) || '{}'
        );
        
        if (!enrollmentData.enrollmentId) {
            console.error('Enrollment ID not found');
            return;
        }
        
        // Update to 100% completion
        const result = await careersyncProfile.updateCourseProgress(
            enrollmentData.enrollmentId,
            100,
            enrollmentData.totalModules
        );
        
        console.log('Course completed:', result);
        showToast('✓ Course Marked as Complete!', 'success');
        
        return result;
    } catch (error) {
        console.error('Course completion failed:', error);
        showToast('Failed to complete course', 'error');
    }
}

// ============ BUTTON CLICK HANDLER EXAMPLES ============

// Example 1: Add to "Start Course" button click
function setupCourseEnrollmentButton() {
    document.addEventListener('click', async (e) => {
        // Look for buttons with data-action="enroll-course"
        if (e.target.getAttribute('data-action') === 'enroll-course') {
            const courseId = e.target.getAttribute('data-course-id');
            const courseData = window.currentCourseData; // Set from your page
            
            await handleCourseEnrollment(courseData);
        }
    });
}

// Example 2: Track module completion automatically
function setupModuleTracker() {
    // This depends on your course UI structure
    // Call this whenever a module is marked as complete
    window.notifyModuleComplete = async (courseId, moduleIndex, totalModules) => {
        await handleModuleCompletion(courseId, moduleIndex, totalModules);
    };
}

// Example 3: Complete course button
function setupCompleteCourseButton() {
    document.addEventListener('click', async (e) => {
        if (e.target.getAttribute('data-action') === 'complete-course') {
            const courseId = e.target.getAttribute('data-course-id');
            await handleCourseCompletion(courseId);
        }
    });
}

// ============ NOTIFICATION HELPER ============

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        margin-bottom: 10px;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
    `;
    document.body.appendChild(container);
    return container;
}

// ============ INITIALIZATION ============

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupCourseEnrollmentButton();
    setupModuleTracker();
    setupCompleteCourseButton();
    console.log('Course generation page integration loaded');
});

// ============ SAMPLE HTML BUTTONS ============
/*

Add these buttons to your course page:

1. Enroll Button:
   <button data-action="enroll-course" data-course-id="course-123">
       Start Course
   </button>

2. Module Complete Button (in module view):
   <button onclick="notifyModuleComplete('course-123', 0, 10)">
       Mark Module Complete
   </button>

3. Complete Course Button:
   <button data-action="complete-course" data-course-id="course-123">
       Finish Course
   </button>

*/

export { handleCourseEnrollment, handleModuleCompletion, handleCourseCompletion, showToast };

