// Standalone Header Component (No ES6 modules)
// Authentication and header rendering for test-generation

(async function() {
  // API Configuration
  const API_BASE = (typeof window.getModuleUrls === 'function')
    ? window.getModuleUrls().backend + '/api'
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : 'https://careersync-backend-oldo.onrender.com/api');

  const isLocalhost = window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1';
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

  // Helper to add auth to URLs
  function addAuthToUrl(url) {
    const token = localStorage.getItem('careersync_token');
    const user = localStorage.getItem('careersync_user');
    
    if (token && user) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}auth_token=${encodeURIComponent(token)}&auth_user=${encodeURIComponent(user)}`;
    }
    return url;
  }

  // Check authentication
  async function checkAuth() {
    try {
      const token = localStorage.getItem('careersync_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const resp = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include',
        headers
      });
      
      if (resp.ok) {
        const data = await resp.json();
        const user = data.user || data;
        localStorage.setItem('careersync_user', JSON.stringify(user));
        return user;
      }
    } catch (error) {
      console.warn('Auth check failed:', error);
    }

    // Fallback to localStorage
    try {
      const userStr = localStorage.getItem('careersync_user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (error) {
      console.error('Error parsing user:', error);
    }

    return null;
  }

  // Logout function
  async function logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('careersync_token');
    localStorage.removeItem('careersync_user');
    localStorage.removeItem('careersync_auth');
    
    window.location.href = moduleUrls.landing + '/auth.html';
  }

  // Create header HTML
  function createHeaderHTML(user, authenticated) {
    const displayName = user?.name || user?.email?.split('@')[0] || 'User';
    
    return `
      <header style="position: sticky; top: 0; z-index: 50; height: 72px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px); border-bottom: 1px solid #e5e7eb; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 100%; display: flex; align-items: center; justify-content: space-between;">
          <a href="${moduleUrls.landing}" style="display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit;">
            <div style="width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);">C</div>
            <span style="font-size: 20px; font-weight: 600; color: #111827;">careersync</span>
          </a>

          <nav style="display: flex; align-items: center; gap: 32px;">
            <a href="${addAuthToUrl(moduleUrls.course)}" style="text-decoration: none; color: #374151; font-weight: 500; font-size: 14px; padding-bottom: 4px; border-bottom: 2px solid transparent; transition: all 0.2s;" onmouseover="this.style.color='#4F46E5'; this.style.borderBottomColor='#4F46E5'" onmouseout="this.style.color='#374151'; this.style.borderBottomColor='transparent'">📚 Course Gen</a>
            <a href="${addAuthToUrl(moduleUrls.roadmap)}" style="text-decoration: none; color: #374151; font-weight: 500; font-size: 14px; padding-bottom: 4px; border-bottom: 2px solid transparent; transition: all 0.2s;" onmouseover="this.style.color='#4F46E5'; this.style.borderBottomColor='#4F46E5'" onmouseout="this.style.color='#374151'; this.style.borderBottomColor='transparent'">🗺️ Roadmaps</a>
            <a href="${addAuthToUrl(moduleUrls.skillEval)}" style="text-decoration: none; color: #374151; font-weight: 500; font-size: 14px; padding-bottom: 4px; border-bottom: 2px solid transparent; transition: all 0.2s;" onmouseover="this.style.color='#4F46E5'; this.style.borderBottomColor='#4F46E5'" onmouseout="this.style.color='#374151'; this.style.borderBottomColor='transparent'">✅ Evaluator</a>
          </nav>
          
          <div style="display: flex; align-items: center; gap: 16px;">
            ${authenticated ? `
              <a href="${moduleUrls.landing}/profile.html" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px; text-decoration: none; transition: background 0.2s;" onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='transparent'">
                <span style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px; box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);">${displayName.charAt(0).toUpperCase()}</span>
                <span style="font-size: 14px; font-weight: 500; color: #374151;">${displayName}</span>
              </a>
              <button id="header-logout-btn" style="padding: 10px 16px; background: #EF4444; color: white; font-size: 14px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);" onmouseover="this.style.background='#DC2626'; this.style.boxShadow='0 4px 6px rgba(0, 0, 0, 0.1)'" onmouseout="this.style.background='#EF4444'; this.style.boxShadow='0 1px 2px rgba(0, 0, 0, 0.05)'">Sign Out</button>
            ` : `
              <a href="${moduleUrls.landing}/auth.html" style="padding: 10px 20px; background: #4F46E5; color: white; font-size: 14px; font-weight: 600; border-radius: 8px; text-decoration: none; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); display: inline-block;" onmouseover="this.style.background='#4338CA'; this.style.boxShadow='0 4px 6px rgba(0, 0, 0, 0.1)'" onmouseout="this.style.background='#4F46E5'; this.style.boxShadow='0 1px 2px rgba(0, 0, 0, 0.05)'">Sign In</a>
            `}
          </div>
        </div>
      </header>
    `;
  }

  // Initialize header
  async function initHeader() {
    const user = await checkAuth();
    const authenticated = !!user;
    
    let headerContainer = document.getElementById('app-header');
    if (!headerContainer) {
      headerContainer = document.createElement('div');
      headerContainer.id = 'app-header';
      document.body.insertBefore(headerContainer, document.body.firstChild);
    }
    
    headerContainer.innerHTML = createHeaderHTML(user, authenticated);
    
    if (authenticated) {
      const logoutBtn = document.getElementById('header-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
      }
    }
  }

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }

  // Re-check auth periodically
  setInterval(initHeader, 10000);
})();
