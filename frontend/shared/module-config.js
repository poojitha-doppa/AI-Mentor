/**
 * Module Configuration - Dynamically handles localhost vs Render URLs
 * This file detects the environment and provides appropriate URLs for navigation
 */

export function getModuleUrls() {
  // Check if running on Render (production)
  const isProduction = window.location.hostname.includes('onrender.com');
  
  if (isProduction) {
    // Explicit Render URLs for the deployed services
    return {
      landing: 'https://careersync-landing-oldo.onrender.com',
      course: 'https://careersync-course-gen-oldo.onrender.com',
      roadmap: 'https://careersync-roadmap-oldo.onrender.com',
      skillEval: 'https://career-sync-skill-evalutor.onrender.com',
      backend: 'https://careersync-backend-oldo.onrender.com'
    };
  } else {
    // Development/localhost
    return {
      landing: 'http://localhost:4173',
      course: 'http://localhost:3002',
      roadmap: 'http://localhost:5173',
      skillEval: 'http://localhost:3001',
      backend: 'http://localhost:5000'
    };
  }
}

export function getBackendUrl() {
  const urls = getModuleUrls();
  return urls.backend;
}

export function getCourseUrl() {
  const urls = getModuleUrls();
  return urls.course;
}

export function getRoadmapUrl() {
  const urls = getModuleUrls();
  return urls.roadmap;
}

export function getEvaluatorUrl() {
  const urls = getModuleUrls();
  return urls.skillEval;
}

export function getLandingUrl() {
  const urls = getModuleUrls();
  return urls.landing;
}

// Log current environment for debugging
console.log('[Module Config] Environment:', {
  hostname: window.location.hostname,
  isProduction: window.location.hostname.includes('onrender.com'),
  moduleUrls: getModuleUrls()
});
