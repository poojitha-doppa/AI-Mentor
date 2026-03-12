// Backend API auth for Landing Page
const API_BASE = (typeof window.getModuleUrls === 'function')
    ? window.getModuleUrls().backend + '/api'
    : (window.location.hostname.includes('onrender.com')
        ? 'https://careersync-backend-oldo.onrender.com/api'
        : 'http://localhost:5000/api');

// Fallback function for localStorage-based demo auth
function useLocalStorageAuth(email, password, action = 'login') {
  const users = JSON.parse(localStorage.getItem('careersync_users') || '{}');
  
  if (action === 'register') {
    if (users[email]) {
      return { success: false, error: 'User already exists' };
    }
    users[email] = { email, password, name: '', createdAt: new Date().toISOString() };
    localStorage.setItem('careersync_users', JSON.stringify(users));
    return { success: true, user: { email, name: '' } };
  }
  
  if (action === 'login') {
    if (!users[email] || users[email].password !== password) {
      return { success: false, error: 'Invalid email or password' };
    }
    return { success: true, user: { email, name: users[email].name || '' } };
  }
}

export async function register(email, password, name = '') {
  try {
    console.log('🔄 Attempting backend registration...');
    console.log('API URL:', `${API_BASE}/auth/register`);
    
    const resp = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, name })
    });
    
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: 'Registration failed' }));
      console.error('❌ Backend registration failed!');
      console.error('Status:', resp.status);
      console.error('Error:', err);
      console.warn('⚠️  Falling back to localStorage (NOT SAVED TO DATABASE!)');
      // Fallback to localStorage if backend fails
      return useLocalStorageAuth(email, password, 'register');
    }
    
    const data = await resp.json();
    console.log('✅ Backend registration SUCCESS!');
    console.log('✅ User saved to DATABASE:', data.user);
    
    // Store token in localStorage for cross-domain navigation
    if (data.token) {
      localStorage.setItem('careersync_token', data.token);
      console.log('✅ Token stored for cross-domain auth');
    }
    
    return { success: true, user: data.user, token: data.token };
  } catch (error) {
    console.error('❌ Registration network error:', error);
    console.warn('⚠️  Using localStorage auth as fallback (NOT SAVED TO DATABASE!)');
    // Fallback to localStorage for demo purposes
    return useLocalStorageAuth(email, password, 'register');
  }
}

export async function login(email, password) {
  try {
    console.log('🔄 Attempting backend login...');
    console.log('API URL:', `${API_BASE}/auth/login`);
    
    const resp = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: 'Login failed' }));
      console.error('❌ Backend login failed!');
      console.error('Status:', resp.status);
      console.error('Error:', err);
      console.warn('⚠️  Falling back to localStorage (NOT FROM DATABASE!)');
      return useLocalStorageAuth(email, password, 'login');
    }

    const data = await resp.json();
    console.log('✅ Backend login SUCCESS!');
    console.log('✅ User fetched from DATABASE:', data.user);
    
    // Store token in localStorage for cross-domain navigation
    if (data.token) {
      localStorage.setItem('careersync_token', data.token);
      console.log('✅ Token stored for cross-domain auth');
    }
    
    return { success: true, user: data.user, token: data.token };
  } catch (error) {
    console.error('❌ Login network error:', error);
    console.warn('⚠️  Using localStorage auth as fallback (NOT FROM DATABASE!)');
    // Fallback to localStorage for demo purposes
    return useLocalStorageAuth(email, password, 'login');
  }
}

export async function requestOtp(email) {
  try {
    const resp = await fetch(`${API_BASE}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email })
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.warn('OTP request failed:', data);
      // For demo: generate and store a demo OTP
      const demoOtp = '123456';
      localStorage.setItem(`otp_${email}`, demoOtp);
      localStorage.setItem(`otp_time_${email}`, Date.now().toString());
      console.log('Demo OTP generated (localStorage):', demoOtp);
      return { success: true, message: `Demo OTP: ${demoOtp}`, demoMode: true };
    }
    return { success: true, message: data.message || 'OTP sent to email' };
  } catch (error) {
    console.error('OTP request error:', error);
    // Demo OTP for testing
    const demoOtp = '123456';
    localStorage.setItem(`otp_${email}`, demoOtp);
    localStorage.setItem(`otp_time_${email}`, Date.now().toString());
    return { success: true, message: `Demo OTP (no email): ${demoOtp}`, demoMode: true };
  }
}

export async function loginWithOtp(email, otp) {
  try {
    // Check if using demo OTP
    const storedOtp = localStorage.getItem(`otp_${email}`);
    const otpTime = localStorage.getItem(`otp_time_${email}`);
    
    if (storedOtp && otp === storedOtp && otpTime) {
      const age = Date.now() - parseInt(otpTime);
      if (age < 5 * 60 * 1000) { // 5 minute validity
        localStorage.removeItem(`otp_${email}`);
        localStorage.removeItem(`otp_time_${email}`);
        return { success: true, user: { email } };
      }
    }
    
    const resp = await fetch(`${API_BASE}/auth/login-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, otp })
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return { success: false, error: data.error || 'Invalid OTP' };
    }
    return { success: true, user: data.user };
  } catch (error) {
    console.error('OTP login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function logout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
  return { success: true };
}

export async function getCurrentUser() {
  try {
    const resp = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include'
    });
    
    if (!resp.ok) {
      return { success: false, user: null };
    }
    
    const data = await resp.json();
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Get current user error:', error);
    return { success: false, user: null };
  }
}
