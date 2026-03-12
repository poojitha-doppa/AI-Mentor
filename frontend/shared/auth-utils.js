/**
 * Cross-domain authentication utilities
 * Handles passing auth tokens between different app domains
 */

// Extract and restore auth from URL parameters
export function restoreAuthFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('auth_token');
  const userStr = params.get('auth_user');
  
  if (token && userStr) {
    try {
      // Store in localStorage
      localStorage.setItem('careersync_token', token);
      localStorage.setItem('careersync_user', userStr);
      
      console.log('✅ Auth restored from URL parameters');
      
      // Clean up URL (remove auth params)
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
      
      return true;
    } catch (error) {
      console.error('Error restoring auth from URL:', error);
    }
  }
  return false;
}

// Get stored auth token
export function getAuthToken() {
  return localStorage.getItem('careersync_token') || '';
}

// Get stored user
export function getStoredUser() {
  try {
    const userStr = localStorage.getItem('careersync_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
}

// Check if authenticated (locally)
export function isAuthenticatedLocally() {
  return !!getAuthToken() && !!getStoredUser();
}

// Clear auth
export function clearAuth() {
  localStorage.removeItem('careersync_token');
  localStorage.removeItem('careersync_user');
  localStorage.removeItem('careersync_auth');
  localStorage.removeItem('careersync_profile_data');
}

// Set auth
export function setAuth(token, user) {
  localStorage.setItem('careersync_token', token);
  if (typeof user === 'string') {
    localStorage.setItem('careersync_user', user);
  } else {
    localStorage.setItem('careersync_user', JSON.stringify(user));
  }
}

// Setup auth header for fetch requests
export function getAuthHeaders() {
  const token = getAuthToken();
  if (!token) return { 'Content-Type': 'application/json' };
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}
