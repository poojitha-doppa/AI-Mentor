// Shared Header Component for Vanilla JS Apps
// Uses shared/auth.js for authentication state

import { getCurrentUser, logout, isAuthenticated } from './auth.js';

// Helper to get auth token for cross-domain navigation
function getAuthToken() {
  return localStorage.getItem('careersync_token') || '';
}

// Helper to append auth token to URLs for cross-domain navigation
function addAuthToUrl(url) {
  const token = getAuthToken();
  const user = localStorage.getItem('careersync_user');
  
  if (token && user) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}auth_token=${encodeURIComponent(token)}&auth_user=${encodeURIComponent(user)}`;
  }
  return url;
}

const isLocalhost = window.location.hostname.includes('localhost')
  || window.location.hostname === '127.0.0.1';
const moduleUrls = (typeof window.getModuleUrls === 'function')
  ? window.getModuleUrls()
  : (isLocalhost
      ? {
          landing: 'http://localhost:4173',
          course: 'http://localhost:3002',
          roadmap: 'http://localhost:5173',
          skillEval: 'http://localhost:3001'
        }
      : {
          landing: 'https://careersync-landing-oldo.onrender.com',
          course: 'https://careersync-course-gen-oldo.onrender.com',
          roadmap: 'https://careersync-roadmap-oldo.onrender.com',
          skillEval: 'https://career-sync-skill-evalutor.onrender.com'
        });

// Header HTML Template
const createHeaderHTML = (user, authenticated) => {
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  
  return `
    <header style="
      position: sticky;
      top: 0;
      z-index: 50;
      height: 72px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    ">
      <div style="
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
      ">
        <!-- Brand -->
        <a href="${moduleUrls.landing}" style="
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: inherit;
        ">
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
            box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);
          ">C</div>
          <span style="
            font-size: 20px;
            font-weight: 600;
            color: #111827;
          ">careersync</span>
        </a>

        <!-- Navigation -->
        <nav style="display: flex; align-items: center; gap: 32px;">
          <a href="${addAuthToUrl(moduleUrls.course)}" style="
            text-decoration: none;
            color: #374151;
            font-weight: 500;
            font-size: 14px;
            padding-bottom: 4px;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
          " onmouseover="this.style.color='#4F46E5'; this.style.borderBottomColor='#4F46E5'" 
             onmouseout="this.style.color='#374151'; this.style.borderBottomColor='transparent'">
            📚 Course Gen
          </a>
          <a href="${addAuthToUrl(moduleUrls.roadmap)}" style="
            text-decoration: none;
            color: #374151;
            font-weight: 500;
            font-size: 14px;
            padding-bottom: 4px;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
          " onmouseover="this.style.color='#4F46E5'; this.style.borderBottomColor='#4F46E5'" 
             onmouseout="this.style.color='#374151'; this.style.borderBottomColor='transparent'">
            🗺️ Roadmaps
          </a>
          <a href="${addAuthToUrl(moduleUrls.skillEval)}" style="
            text-decoration: none;
            color: #374151;
            font-weight: 500;
            font-size: 14px;
            padding-bottom: 4px;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
          " onmouseover="this.style.color='#4F46E5'; this.style.borderBottomColor='#4F46E5'" 
             onmouseout="this.style.color='#374151'; this.style.borderBottomColor='transparent'">
            ✅ Evaluator
          </a>
        </nav>

        <!-- Auth Section -->
        <div style="display: flex; align-items: center; gap: 16px;">
          ${authenticated ? `
            <a href="${moduleUrls.landing}/profile.html" style="
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              border-radius: 8px;
              text-decoration: none;
              transition: background 0.2s;
            " onmouseover="this.style.background='#F9FAFB'" 
               onmouseout="this.style.background='transparent'">
              <span style="
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
                font-size: 14px;
                box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
              ">${displayName.charAt(0).toUpperCase()}</span>
              <span style="
                font-size: 14px;
                font-weight: 500;
                color: #374151;
              ">${displayName}</span>
            </a>
            <button id="header-logout-btn" style="
              padding: 10px 16px;
              background: #EF4444;
              color: white;
              font-size: 14px;
              font-weight: 600;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            " onmouseover="this.style.background='#DC2626'; this.style.boxShadow='0 4px 6px rgba(0, 0, 0, 0.1)'" 
               onmouseout="this.style.background='#EF4444'; this.style.boxShadow='0 1px 2px rgba(0, 0, 0, 0.05)'">
              Sign Out
            </button>
          ` : `
            <a href="${moduleUrls.landing}/auth.html" style="
              padding: 10px 20px;
              background: #4F46E5;
              color: white;
              font-size: 14px;
              font-weight: 600;
              border-radius: 8px;
              text-decoration: none;
              transition: all 0.2s;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
              display: inline-block;
            " onmouseover="this.style.background='#4338CA'; this.style.boxShadow='0 4px 6px rgba(0, 0, 0, 0.1)'" 
               onmouseout="this.style.background='#4F46E5'; this.style.boxShadow='0 1px 2px rgba(0, 0, 0, 0.05)'">
              Sign In
            </a>
          `}
        </div>
      </div>
    </header>
  `;
};

// Initialize and render header
async function initHeader() {
  const authenticated = await isAuthenticated();
  const user = authenticated ? await getCurrentUser() : null;
  
  // Find or create header container
  let headerContainer = document.getElementById('app-header');
  if (!headerContainer) {
    headerContainer = document.createElement('div');
    headerContainer.id = 'app-header';
    document.body.insertBefore(headerContainer, document.body.firstChild);
  }
  
  // Render header
  headerContainer.innerHTML = createHeaderHTML(user, authenticated);
  
  // Attach logout handler if authenticated
  if (authenticated) {
    const logoutBtn = document.getElementById('header-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await logout();
      });
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeader);
} else {
  initHeader();
}

// Re-check auth every 10 seconds
setInterval(initHeader, 10000);

export { initHeader };

