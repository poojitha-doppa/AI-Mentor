import { api } from './scripts/api.js';
import { getCurrentUser, logout } from '../shared/auth.js';
import { getModuleUrls } from '../shared/module-config.js';

// Initialize header component
import '../shared/header-component.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Module Links Configuration - Dynamic based on environment
    const defaultModuleLinks = getModuleUrls();

    const MODULE_LINKS = { ...defaultModuleLinks, ...(window.careersync_MODULE_URLS || {}) };

    // UI Elements
    const navAuthContainer = document.getElementById('nav-auth-container');

    // Helper to append auth token to URLs for cross-module navigation
    function addAuthToUrl(url) {
        const token = localStorage.getItem('careersync_token');
        const user = localStorage.getItem('careersync_user');
        
        if (token && user) {
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}auth_token=${encodeURIComponent(token)}&auth_user=${encodeURIComponent(user)}`;
        }
        return url;
    }

    // Wire module launch buttons/links
    document.querySelectorAll('[data-module-target]').forEach((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const targetKey = el.getAttribute('data-module-target');
            const directUrl = el.getAttribute('data-module-url');
            let url = (targetKey && MODULE_LINKS[targetKey]) || directUrl;

            if (url) {
                // Add auth tokens to URL for cross-domain authentication
                url = addAuthToUrl(url);
                // Open in new tab/window instead of redirecting
                window.open(url, '_blank');
            } else {
                console.warn(`No module URL configured for target: ${targetKey}`);
            }
        });
    });

    // Check Auth State
    await checkAuthState();

    async function checkAuthState() {
        // Check cookie-based auth via API
        const response = await getCurrentUser();
        
        if (response.success && response.user) {
            // User is LOGGED IN
            const userEmail = response.user.email || '';
            const userName = response.user.name || userEmail.split('@')[0];
            const isAdminUser = response.user.role === 'admin';
            const adminLink = isAdminUser
                ? `<a href="/admin-dashboard.html" style="margin-right: 8px; font-size: 0.85rem; color: #4F46E5; text-decoration: none; font-weight: 600;">Admin Dashboard</a>`
                : '';

            // Update Nav
            if (navAuthContainer) {
                navAuthContainer.innerHTML = `
                    <div class="user-menu">
                        ${adminLink}
                        <span class="user-name" title="${userEmail}">${userName}</span>
                        <button id="btn-logout" class="logout-btn">Sign Out</button>
                    </div>
                `;

                // Attach Logout Listener
                document.getElementById('btn-logout').addEventListener('click', handleLogout);
            }
        } else {
            // User is NOT logged in
            if (navAuthContainer) {
                navAuthContainer.innerHTML = `
                    <a href="/auth.html" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">Sign In</a>
                `;
            }
        }
    }

    async function handleLogout() {
        if (confirm('Are you sure you want to sign out?')) {
            // Sign out - clear auth
            await logout();
            
            // Refresh state
            await checkAuthState();
            
            // Reload page to clear any other state
            window.location.reload();
        }
    }
});

// Navbar active state on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
        }
    }
});

// Add animation on scroll for cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards and module cards
document.querySelectorAll('.feature-card, .module-card, .step').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Log module status
console.log('careersync Landing Page loaded successfully');
console.log('Available modules:');
console.log('- Course Generator: http://localhost:3002');
console.log('- Skill Evaluator: http://localhost:3001');
console.log('- Roadmap Generator: http://localhost:5173');

