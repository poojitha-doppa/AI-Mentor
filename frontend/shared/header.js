/**
 * UNIFIED HEADER COMPONENT - Shared across all frontend applications
 * Works with Next.js and Vanilla JavaScript
 */

// ═══════════════════════════════════════════════════════════════════
// CSS STYLES - Include this in your stylesheet or as a separate file
// ═══════════════════════════════════════════════════════════════════

const HEADER_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --brand-primary: #4F46E5;
  --brand-secondary: #7C3AED;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-tertiary: #94A3B8;
  --bg-light: #FFFFFF;
  --bg-hover: #F8FAFC;
  --border-light: #E2E8F0;
  --header-height: 72px;
  --container-max: 1200px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  text-decoration: none !important;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  margin: 0;
  padding: 0;
}

.careersync-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--header-height);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.careersync-header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
}

.careersync-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none !important;
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 700;
  transition: opacity var(--transition);
}

.careersync-brand:hover {
  opacity: 0.8;
}

.careersync-brand-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.75rem;
}

.careersync-nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
  flex: 1;
  justify-content: center;
}

.careersync-nav-link {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.9rem;
  text-decoration: none !important;
  transition: color var(--transition);
  cursor: pointer;
  padding: 8px 0;
  border-bottom: 2px solid transparent;
}

.careersync-nav-link:hover {
  color: var(--brand-primary);
  border-bottom-color: var(--brand-primary);
}

.careersync-nav-link.active {
  color: var(--brand-primary);
  border-bottom-color: var(--brand-primary);
}

.careersync-nav-auth {
  display: flex;
  align-items: center;
  gap: 16px;
}

.careersync-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition);
  text-decoration: none !important;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.careersync-btn-primary {
  background: var(--brand-primary);
  color: white;
  text-decoration: none !important;
}

.careersync-btn-primary:hover {
  background: var(--brand-secondary);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.careersync-btn-secondary {
  background: var(--bg-light);
  color: var(--brand-primary);
  border: 1px solid var(--border-light);
  text-decoration: none !important;
}

.careersync-btn-secondary:hover {
  background: var(--bg-hover);
  border-color: var(--brand-primary);
}

.careersync-btn-danger {
  background: #EF4444;
  color: white;
  text-decoration: none !important;
}

.careersync-btn-danger:hover {
  background: #DC2626;
  box-shadow: var(--shadow-md);
}

.careersync-mobile-menu {
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
}

@media (max-width: 768px) {
  .careersync-nav-links {
    display: none;
  }

  .careersync-mobile-menu {
    display: block;
  }

  .careersync-nav-links.mobile-open {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: var(--header-height);
    left: 0;
    right: 0;
    background: var(--bg-light);
    padding: 16px;
    border-bottom: 1px solid var(--border-light);
    gap: 8px;
  }

  .careersync-nav-link {
    padding: 12px;
    border-bottom: none;
  }
}
`;

// ═══════════════════════════════════════════════════════════════════
// HEADER HTML TEMPLATE
// ═══════════════════════════════════════════════════════════════════

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

const HEADER_HTML = `
<header class="careersync-header">
  <div class="careersync-header-container">
    <!-- Brand -->
    <a href="${moduleUrls.landing}" class="careersync-brand">
      <div class="careersync-brand-icon">C</div>
      <span>Career Sync</span>
    </a>

    <!-- Navigation Links -->
    <nav class="careersync-nav-links" id="careersync-nav-links">
      <a 
        href="${moduleUrls.course}" 
        class="careersync-nav-link" 
        data-module="course"
      >
        📚 Course Gen
      </a>
      <a 
        href="${moduleUrls.roadmap}" 
        class="careersync-nav-link" 
        data-module="roadmap"
      >
        🗺️ Roadmaps
      </a>
      <a 
        href="${moduleUrls.skillEval}" 
        class="careersync-nav-link" 
        data-module="evaluator"
      >
        ✅ Evaluator
      </a>
    </nav>

    <!-- Auth Section -->
    <div class="careersync-nav-auth" id="careersync-nav-auth">
      <a href="/auth" class="careersync-btn careersync-btn-primary">
        Sign In
      </a>
    </div>

    <!-- Mobile Menu Toggle -->
    <button class="careersync-mobile-menu" id="careersync-mobile-menu">
      ☰
    </button>
  </div>
</header>
`;

// ═══════════════════════════════════════════════════════════════════
// JAVASCRIPT FUNCTIONALITY
// ═══════════════════════════════════════════════════════════════════

class careersyncHeader {
  constructor(options = {}) {
    this.options = {
      containerSelector: 'body',
      checkAuthInterval: 5000, // Check auth every 5 seconds
      debugMode: false,
      ...options
    };

    this.isAuthenticated = false;
    this.currentUser = null;
    this.currentModule = null;

    this.init();
  }

  init() {
    this.log('Initializing careersync Header');
    
    // Inject CSS if not already present
    if (!document.getElementById('careersync-header-styles')) {
      this.injectStyles();
    }

    // Inject HTML if not already present
    if (!document.querySelector('.careersync-header')) {
      this.injectHTML();
    }

    // Setup event listeners
    this.setupEventListeners();

    // Check authentication status
    this.checkAuthStatus();

    // Set interval to check auth status periodically
    setInterval(() => this.checkAuthStatus(), this.options.checkAuthInterval);

    this.log('careersync Header initialized successfully');
  }

  injectStyles() {
    const style = document.createElement('style');
    style.id = 'careersync-header-styles';
    style.textContent = HEADER_STYLES;
    document.head.appendChild(style);
    this.log('Styles injected');
  }

  injectHTML() {
    const container = document.querySelector(this.options.containerSelector);
    if (!container) {
      console.error('Container not found:', this.options.containerSelector);
      return;
    }

    const headerElement = document.createElement('div');
    headerElement.innerHTML = HEADER_HTML;
    container.insertBefore(headerElement.firstElementChild, container.firstChild);
    this.log('HTML injected');
  }

  setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('careersync-mobile-menu');
    const navLinks = document.getElementById('careersync-nav-links');

    if (mobileMenuBtn && navLinks) {
      mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
      });

      // Close menu when a link is clicked
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('mobile-open');
        });
      });
    }

    // Module navigation
    document.querySelectorAll('[data-module]').forEach(element => {
      element.addEventListener('click', (e) => {
        const module = element.dataset.module;
        this.setActiveModule(module);
      });
    });

    // Logout button
    const logoutBtn = document.getElementById('careersync-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  }

  async checkAuthStatus() {
    // Check authentication via API
    try {
      const backendUrl = window.getModuleUrls ? window.getModuleUrls().backend : (window.location.hostname.includes('onrender.com') ? 'https://careersync-backend-oldo.onrender.com' : 'http://localhost:5000');
      const response = await fetch(backendUrl + '/api/auth/me', {
        credentials: 'include' // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        this.currentUser = data.user;
        this.isAuthenticated = true;
        this.log('User authenticated:', this.currentUser.email);
        this.updateAuthUI();
      } else {
        if (this.isAuthenticated) {
          this.isAuthenticated = false;
          this.currentUser = null;
          this.updateAuthUI();
        }
      }
    } catch (error) {
      this.log('Auth check failed:', error.message);
      if (this.isAuthenticated) {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.updateAuthUI();
      }
    }
  }

  updateAuthUI() {
    const authContainer = document.getElementById('careersync-nav-auth');
    if (!authContainer) return;

    if (this.isAuthenticated && this.currentUser) {
      const displayName = this.currentUser.name || this.currentUser.full_name || this.currentUser.email?.split('@')[0] || 'User';
      const landingUrl = window.getModuleUrls ? window.getModuleUrls().landing : (window.location.hostname.includes('onrender.com') ? 'https://careersync-landing-oldo.onrender.com' : 'http://localhost:4173');
      const profileUrl = landingUrl + '/profile.html';
      
      authContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <a href="${profileUrl}" style="color: var(--text-secondary); font-size: 0.875rem; text-decoration: none !important; display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-hover, #F8FAFC)'" onmouseout="this.style.background='transparent'">
            <span style="display: inline-block; width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 15px; box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);">
              ${displayName.charAt(0).toUpperCase()}
            </span>
            <span style="font-weight: 500;">${displayName}</span>
          </a>
          <button id="careersync-logout-btn" class="careersync-btn careersync-btn-danger">
            Sign Out
          </button>
        </div>
      `;

      // Re-attach logout event listener
      const logoutBtn = document.getElementById('careersync-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.logout();
        });
      }
    } else {
      const landingUrl = window.getModuleUrls ? window.getModuleUrls().landing : (window.location.hostname.includes('onrender.com') ? 'https://careersync-landing-oldo.onrender.com' : 'http://localhost:4173');
      const authUrl = landingUrl + '/auth.html';
      
      authContainer.innerHTML = `
        <a href="${authUrl}" class="careersync-btn careersync-btn-primary">
          Sign In
        </a>
      `;
    }
  }

  async logout() {
    try {
      const backendUrl = window.getModuleUrls ? window.getModuleUrls().backend : (window.location.hostname.includes('onrender.com') ? 'https://careersync-backend-oldo.onrender.com' : 'http://localhost:5000');
      await fetch(backendUrl + '/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      this.log('Logout error:', error.message);
    }

    this.isAuthenticated = false;
    this.currentUser = null;
    this.updateAuthUI();
    this.log('User logged out');
    
    // Redirect to auth page
    const landingUrl = window.getModuleUrls ? window.getModuleUrls().landing : (window.location.hostname.includes('onrender.com') ? 'https://careersync-landing-oldo.onrender.com' : 'http://localhost:4173');
    const authUrl = landingUrl + '/auth.html';
    window.location.href = authUrl;
  }

  setActiveModule(module) {
    this.currentModule = module;
    
    // Update active state in nav
    document.querySelectorAll('[data-module]').forEach(link => {
      if (link.dataset.module === module) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  log(message, data) {
    if (this.options.debugMode) {
      console.log('[careersyncHeader]', message, data || '');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// AUTO-INITIALIZATION
// ═══════════════════════════════════════════════════════════════════

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.careeroHeader = new careersyncHeader({ debugMode: false });
    });
  } else {
    window.careeroHeader = new careersyncHeader({ debugMode: false });
  }
}

// Export for use as ES module (Next.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { careersyncHeader, HEADER_STYLES, HEADER_HTML };
}

