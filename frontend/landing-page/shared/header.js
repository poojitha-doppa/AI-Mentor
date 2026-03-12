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

.Career Sync-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--header-height);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.Career Sync-header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
}

.Career Sync-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none !important;
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 700;
  transition: opacity var(--transition);
}

.Career Sync-brand:hover {
  opacity: 0.8;
}

.Career Sync-brand-icon {
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

.Career Sync-nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
  flex: 1;
  justify-content: center;
}

.Career Sync-nav-link {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.9rem;
  text-decoration: none !important;
  transition: color var(--transition);
  cursor: pointer;
  padding: 8px 0;
  border-bottom: 2px solid transparent;
}

.Career Sync-nav-link:hover {
  color: var(--brand-primary);
  border-bottom-color: var(--brand-primary);
}

.Career Sync-nav-link.active {
  color: var(--brand-primary);
  border-bottom-color: var(--brand-primary);
}

.Career Sync-nav-auth {
  display: flex;
  align-items: center;
  gap: 16px;
}

.Career Sync-btn {
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

.Career Sync-btn-primary {
  background: var(--brand-primary);
  color: white;
  text-decoration: none !important;
}

.Career Sync-btn-primary:hover {
  background: var(--brand-secondary);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.Career Sync-btn-secondary {
  background: var(--bg-light);
  color: var(--brand-primary);
  border: 1px solid var(--border-light);
  text-decoration: none !important;
}

.Career Sync-btn-secondary:hover {
  background: var(--bg-hover);
  border-color: var(--brand-primary);
}

.Career Sync-btn-danger {
  background: #EF4444;
  color: white;
  text-decoration: none !important;
}

.Career Sync-btn-danger:hover {
  background: #DC2626;
  box-shadow: var(--shadow-md);
}

.Career Sync-mobile-menu {
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
}

@media (max-width: 768px) {
  .Career Sync-nav-links {
    display: none;
  }

  .Career Sync-mobile-menu {
    display: block;
  }

  .Career Sync-nav-links.mobile-open {
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

  .Career Sync-nav-link {
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
<header class="Career Sync-header">
  <div class="Career Sync-header-container">
    <!-- Brand -->
    <a href="${moduleUrls.landing}" class="Career Sync-brand">
      <div class="Career Sync-brand-icon">C</div>
      <span>Career Sync</span>
    </a>

    <!-- Navigation Links -->
    <nav class="Career Sync-nav-links" id="Career Sync-nav-links">
      <a 
        href="${moduleUrls.course}" 
        class="Career Sync-nav-link" 
        data-module="course"
      >
        📚 Course Gen
      </a>
      <a 
        href="${moduleUrls.roadmap}" 
        class="Career Sync-nav-link" 
        data-module="roadmap"
      >
        🗺️ Roadmaps
      </a>
      <a 
        href="${moduleUrls.skillEval}" 
        class="Career Sync-nav-link" 
        data-module="evaluator"
      >
        ✅ Evaluator
      </a>
    </nav>

    <!-- Auth Section -->
    <div class="Career Sync-nav-auth" id="Career Sync-nav-auth">
      <a href="/auth" class="Career Sync-btn Career Sync-btn-primary">
        Sign In
      </a>
    </div>

    <!-- Mobile Menu Toggle -->
    <button class="Career Sync-mobile-menu" id="Career Sync-mobile-menu">
      ☰
    </button>
  </div>
</header>
`;

// ═══════════════════════════════════════════════════════════════════
// JAVASCRIPT FUNCTIONALITY
// ═══════════════════════════════════════════════════════════════════

class Career SyncHeader {
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
    this.log('Initializing Career Sync Header');
    
    // Inject CSS if not already present
    if (!document.getElementById('Career Sync-header-styles')) {
      this.injectStyles();
    }

    // Inject HTML if not already present
    if (!document.querySelector('.Career Sync-header')) {
      this.injectHTML();
    }

    // Setup event listeners
    this.setupEventListeners();

    // Check authentication status
    this.checkAuthStatus();

    // Set interval to check auth status periodically
    setInterval(() => this.checkAuthStatus(), this.options.checkAuthInterval);

    this.log('Career Sync Header initialized successfully');
  }

  injectStyles() {
    const style = document.createElement('style');
    style.id = 'Career Sync-header-styles';
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
    const mobileMenuBtn = document.getElementById('Career Sync-mobile-menu');
    const navLinks = document.getElementById('Career Sync-nav-links');

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
    const logoutBtn = document.getElementById('Career Sync-logout-btn');
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
      const response = await fetch('http://localhost:5000/api/auth/me', {
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
    const authContainer = document.getElementById('Career Sync-nav-auth');
    if (!authContainer) return;

    if (this.isAuthenticated && this.currentUser) {
      const displayName = this.currentUser.name || this.currentUser.full_name || this.currentUser.email?.split('@')[0] || 'User';
      const profileUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:4173/profile.html' 
        : '/profile.html';
      
      authContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <a href="${profileUrl}" style="color: var(--text-secondary); font-size: 0.875rem; text-decoration: none !important; display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-hover, #F8FAFC)'" onmouseout="this.style.background='transparent'">
            <span style="display: inline-block; width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 15px; box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);">
              ${displayName.charAt(0).toUpperCase()}
            </span>
            <span style="font-weight: 500;">${displayName}</span>
          </a>
          <button id="Career Sync-logout-btn" class="Career Sync-btn Career Sync-btn-danger">
            Sign Out
          </button>
        </div>
      `;

      // Re-attach logout event listener
      const logoutBtn = document.getElementById('Career Sync-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.logout();
        });
      }
    } else {
      const authUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:4173/auth.html'
        : '/auth.html';
      
      authContainer.innerHTML = `
        <a href="${authUrl}" class="Career Sync-btn Career Sync-btn-primary">
          Sign In
        </a>
      `;
    }
  }

  async logout() {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
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
    const authUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:4173/auth.html'
      : '/auth.html';
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
      console.log('[Career SyncHeader]', message, data || '');
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
      window.careeroHeader = new Career SyncHeader({ debugMode: false });
    });
  } else {
    window.careeroHeader = new Career SyncHeader({ debugMode: false });
  }
}

// Export for use as ES module (Next.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Career SyncHeader, HEADER_STYLES, HEADER_HTML };
}
