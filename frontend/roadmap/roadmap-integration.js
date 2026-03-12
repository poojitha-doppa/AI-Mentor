// Roadmap Page - Database Integration Code
// Add this to your roadmap page (http://localhost:5173)

// ============ IMPORTS ============
// Make sure to include the profile-utils.js from landing page
// Add this line to your HTML or import in your component:
// <script src="http://localhost:4173/profile-utils.js"></script>

// ============ ROADMAP ENROLLMENT HANDLER ============
// Call this function when user clicks "Start Roadmap" or "Generate Roadmap" button

async function handleRoadmapEnrollment(roadmapData) {
    console.log('Enrolling in roadmap:', roadmapData);
    
    try {
        // Data structure expected:
        const enrollmentData = {
            id: roadmapData.id || roadmapData.roadmapId || `roadmap-${Date.now()}`,
            title: roadmapData.title || roadmapData.careerGoal || roadmapData.targetRole,
            careerGoal: roadmapData.careerGoal || roadmapData.title,
            targetRole: roadmapData.targetRole || roadmapData.careerGoal,
            stages: roadmapData.stages?.length || roadmapData.totalStages || 5,
            totalStages: roadmapData.stages?.length || roadmapData.totalStages || 5,
            completedStages: 0,
            progress: 0,
            duration: roadmapData.duration || '6 months',
            status: 'in-progress',
            roadmapData: roadmapData.stages || roadmapData.roadmapData || []
        };
        
        // Save to backend and localStorage
        const result = await careersyncProfile.saveRoadmap(enrollmentData);
        
        if (result) {
            console.log('Roadmap enrollment successful:', result);
            
            // Store the enrollment ID for progress updates
            localStorage.setItem(`roadmap_enrollment_${enrollmentData.id}`, JSON.stringify({
                enrollmentId: result._id,
                roadmapId: enrollmentData.id,
                totalStages: enrollmentData.totalStages
            }));
            
            // Show success message
            alert(`✓ Successfully started ${enrollmentData.title} roadmap`);
            
            // Optional: Refresh UI or update progress display
            // updateRoadmapDisplay();
        }
    } catch (error) {
        console.error('Enrollment failed:', error);
        alert('Failed to enroll in roadmap. Please try again.');
    }
}

// ============ ROADMAP STAGE COMPLETION HANDLER ============
// Call this function when user completes a stage

async function handleStageCompletion(roadmapId, stageIndex, totalStages) {
    console.log(`Stage ${stageIndex + 1}/${totalStages} completed for roadmap ${roadmapId}`);
    
    try {
        // Get enrollment ID
        const enrollmentData = JSON.parse(
            localStorage.getItem(`roadmap_enrollment_${roadmapId}`) || '{}'
        );
        
        if (!enrollmentData.enrollmentId) {
            console.error('Enrollment ID not found');
            return;
        }
        
        // Calculate progress
        const completedStages = stageIndex + 1;
        const progress = (completedStages / totalStages) * 100;
        
        // Update backend
        const result = await careersyncProfile.updateRoadmapProgress(
            enrollmentData.enrollmentId,
            Math.round(progress),
            completedStages
        );
        
        console.log('Stage progress updated:', result);
        
        // Show toast notification
        showToast(`Stage ${completedStages}/${totalStages} Completed - ${Math.round(progress)}%`);
        
        // If roadmap is complete
        if (progress >= 100) {
            showToast('✓ Roadmap Completed! Check your profile.', 'success');
            setTimeout(() => {
                // Optional: Show celebration or redirect
                // window.open('http://localhost:4173/profile.html', '_blank');
            }, 2000);
        }
        
        return result;
    } catch (error) {
        console.error('Stage completion update failed:', error);
        showToast('Failed to update progress', 'error');
    }
}

// ============ ROADMAP UPDATE PROGRESS HANDLER ============
// Call this when updating progress manually (e.g., when user navigates between stages)

async function handleRoadmapProgressUpdate(roadmapId, completedStages, totalStages) {
    console.log(`Updating roadmap progress: ${completedStages}/${totalStages}`);
    
    try {
        const enrollmentData = JSON.parse(
            localStorage.getItem(`roadmap_enrollment_${roadmapId}`) || '{}'
        );
        
        if (!enrollmentData.enrollmentId) {
            console.error('Enrollment ID not found');
            return;
        }
        
        const progress = (completedStages / totalStages) * 100;
        
        // Update backend
        const result = await careersyncProfile.updateRoadmapProgress(
            enrollmentData.enrollmentId,
            Math.round(progress),
            completedStages
        );
        
        console.log('Roadmap progress updated:', result);
        return result;
    } catch (error) {
        console.error('Progress update failed:', error);
    }
}

// ============ COMPLETE ROADMAP HANDLER ============
// Call this when user marks entire roadmap as complete

async function handleRoadmapCompletion(roadmapId) {
    console.log('Completing roadmap:', roadmapId);
    
    try {
        const enrollmentData = JSON.parse(
            localStorage.getItem(`roadmap_enrollment_${roadmapId}`) || '{}'
        );
        
        if (!enrollmentData.enrollmentId) {
            console.error('Enrollment ID not found');
            return;
        }
        
        // Update to 100% completion
        const result = await careersyncProfile.updateRoadmapProgress(
            enrollmentData.enrollmentId,
            100,
            enrollmentData.totalStages
        );
        
        console.log('Roadmap completed:', result);
        showToast('✓ Roadmap Marked as Complete!', 'success');
        
        return result;
    } catch (error) {
        console.error('Roadmap completion failed:', error);
        showToast('Failed to complete roadmap', 'error');
    }
}

// ============ BUTTON CLICK HANDLER EXAMPLES ============

// Example 1: Add to "Start Roadmap" button
function setupRoadmapEnrollmentButton() {
    document.addEventListener('click', async (e) => {
        if (e.target.getAttribute('data-action') === 'enroll-roadmap') {
            const roadmapId = e.target.getAttribute('data-roadmap-id');
            const roadmapData = window.currentRoadmapData; // Set from your page
            
            await handleRoadmapEnrollment(roadmapData);
        }
    });
}

// Example 2: Track stage completion automatically
function setupStageTracker() {
    window.notifyStageComplete = async (roadmapId, stageIndex, totalStages) => {
        await handleStageCompletion(roadmapId, stageIndex, totalStages);
    };
}

// Example 3: Complete roadmap button
function setupCompleteRoadmapButton() {
    document.addEventListener('click', async (e) => {
        if (e.target.getAttribute('data-action') === 'complete-roadmap') {
            const roadmapId = e.target.getAttribute('data-roadmap-id');
            await handleRoadmapCompletion(roadmapId);
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

document.addEventListener('DOMContentLoaded', () => {
    setupRoadmapEnrollmentButton();
    setupStageTracker();
    setupCompleteRoadmapButton();
    console.log('Roadmap page integration loaded');
});

// ============ SAMPLE HTML BUTTONS ============
/*

Add these buttons to your roadmap page:

1. Start Roadmap Button:
   <button data-action="enroll-roadmap" data-roadmap-id="roadmap-123">
       Start Roadmap
   </button>

2. Stage Complete Button (in stage view):
   <button onclick="notifyStageComplete('roadmap-123', 0, 5)">
       Mark Stage Complete
   </button>

3. Complete Roadmap Button:
   <button data-action="complete-roadmap" data-roadmap-id="roadmap-123">
       Finish Roadmap
   </button>

*/

export { handleRoadmapEnrollment, handleStageCompletion, handleRoadmapProgressUpdate, handleRoadmapCompletion, showToast };

