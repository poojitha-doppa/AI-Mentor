import { register, login, requestOtp, loginWithOtp } from './api-auth.js';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = '844001953688-5r9hfnp15akd17ouu20h2hgv8s4jbprm.apps.googleusercontent.com'; // Replace with your actual Google Client ID

// Global views object
let views = {};

function getPostLoginUrl(user = {}) {
    if (user && user.role === 'admin') {
        return window.getModuleUrls().landing + '/admin-dashboard.html';
    }
    return window.getModuleUrls().landing + '/profile.html';
}

// Make switchView global for onclick handlers
window.switchView = function(viewName) {
    Object.values(views).forEach(el => el.classList.remove('active'));
    if (views[viewName]) {
        views[viewName].classList.add('active');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Google Sign-In
    initializeGoogleSignIn();

    // DOM Elements
    views = {
        login: document.getElementById('view-login'),
        signup: document.getElementById('view-signup'),
        forgot: document.getElementById('view-forgot'),
        verify: document.getElementById('view-verify')
    };

    const forms = {
        login: document.getElementById('form-login'),
        signup: document.getElementById('form-signup'),
        forgot: document.getElementById('form-forgot'),
        verify: document.getElementById('form-verify')
    };

    // Navigation Switchers
    document.querySelectorAll('[data-target]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = e.target.getAttribute('data-target');
            switchView(targetView);
        });
    });

    function showError(form, message) {
        // Remove existing error message if any
        const existingError = form.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Create and show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'color: #ef4444; background: #fee2e2; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 14px;';
        errorDiv.textContent = message;
        form.insertBefore(errorDiv, form.firstChild);
    }

    function setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.textContent = 'Loading...';
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || button.textContent;
        }
    }

    // Login Handler via backend API
    forms.login.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const submitBtn = forms.login.querySelector('button[type="submit"]');

        setButtonLoading(submitBtn, true);
        const result = await login(email, password);

        if (result.success) {
            console.log('Login successful, storing user data...');
            
            // Store user data and token in localStorage
            if (result.user) {
                localStorage.setItem('careersync_user', JSON.stringify(result.user));
            }
            if (result.token) {
                localStorage.setItem('careersync_token', result.token);
                console.log('✅ Token stored in localStorage');
            }
            
            // Redirect based on role
            const destination = getPostLoginUrl(result.user);
            console.log('Redirecting after login to:', destination);
            window.location.href = destination;
        } else {
            setButtonLoading(submitBtn, false);
            showError(forms.login, result.error || 'Invalid email or password');
        }
    });

    // Signup Handler via backend API with OTP verification
    forms.signup.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const name = document.getElementById('signup-name')?.value || '';
        const submitBtn = forms.signup.querySelector('button[type="submit"]');

        // Basic validation
        if (password.length < 6) {
            showError(forms.signup, 'Password must be at least 6 characters');
            return;
        }

        if (!email) {
            showError(forms.signup, 'Please enter an email address');
            return;
        }

        setButtonLoading(submitBtn, true);

        // First, register the user
        const result = await register(email, password, name);

        if (result.success) {
            console.log('Registration successful:', result);
            
            // Store user data and token in localStorage
            if (result.user) {
                localStorage.setItem('careersync_user', JSON.stringify(result.user));
            }
            if (result.token) {
                localStorage.setItem('careersync_token', result.token);
                console.log('✅ Token stored in localStorage');
            }
            
            setButtonLoading(submitBtn, false);
            
            // Show success message
            const successDiv = document.createElement('div');
            successDiv.style.cssText = 'color: #10b981; background: #d1fae5; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 14px;';
            successDiv.textContent = 'Account created successfully! Redirecting to your profile...';
            forms.signup.insertBefore(successDiv, forms.signup.firstChild);
            
            // Redirect based on role
            setTimeout(() => {
                window.location.href = getPostLoginUrl(result.user);
            }, 1500);
        } else {
            setButtonLoading(submitBtn, false);
            showError(forms.signup, result.error || 'Failed to create account');
        }
    });

    // Request OTP (Email) Handler
    forms.forgot.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        const btn = forms.forgot.querySelector('button[type="submit"]');
        if (!email) return showError(forms.forgot, 'Please enter your email');
        setButtonLoading(btn, true);
        const result = await requestOtp(email);
        setButtonLoading(btn, false);
        if (result.success) {
            // Redirect to dedicated OTP verification page with reset=true flag
            window.location.href = `/verify-otp.html?email=${encodeURIComponent(email)}&reset=true`;
        } else {
            showError(forms.forgot, result.error || 'Failed to send OTP');
        }
    });

    // Verify OTP Handler via backend API
    forms.verify.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('verify-email').value;
        const otp = document.getElementById('verify-otp').value;
        const btn = forms.verify.querySelector('button[type="submit"]');
        if (!otp) return showError(forms.verify, 'Please enter the OTP from your email');
        setButtonLoading(btn, true);
        const result = await loginWithOtp(email, otp);
        setButtonLoading(btn, false);
        if (result.success) {
            if (result.user) {
                localStorage.setItem('careersync_user', JSON.stringify(result.user));
            }
            if (result.token) {
                localStorage.setItem('careersync_token', result.token);
            }
            window.location.href = getPostLoginUrl(result.user);
        } else {
            showError(forms.verify, result.error || 'Invalid OTP');
        }
    });
});

// ===== GOOGLE SIGN-IN INTEGRATION =====

function initializeGoogleSignIn() {
    // Wait for Google SDK to load
    const initGoogle = () => {
        if (typeof google !== 'undefined' && google.accounts) {
            try {
                google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleSignIn,
                    auto_select: false,
                });
                console.log('✅ Google Sign-In initialized successfully');
            } catch (error) {
                console.error('❌ Error initializing Google Sign-In:', error);
                console.warn('⚠️ Google Sign-In may not work. Please configure Google OAuth in Google Cloud Console');
                disableGoogleSignInButtons();
            }
        } else {
            console.log('⏳ Waiting for Google SDK to load...');
            setTimeout(initGoogle, 500);
        }
    };

    // Start initialization
    setTimeout(initGoogle, 100);

    // Attach click handlers to Google buttons
    const googleSignInBtn = document.getElementById('google-signin-btn');
    const googleSignUpBtn = document.getElementById('google-signup-btn');

    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Google Sign-In button clicked');
            triggerGoogleSignIn();
        });
    }

    if (googleSignUpBtn) {
        googleSignUpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Google Sign-Up button clicked');
            triggerGoogleSignIn();
        });
    }
}

function disableGoogleSignInButtons() {
    const googleSignInBtn = document.getElementById('google-signin-btn');
    const googleSignUpBtn = document.getElementById('google-signup-btn');
    
    if (googleSignInBtn) {
        googleSignInBtn.disabled = true;
        googleSignInBtn.style.opacity = '0.5';
        googleSignInBtn.style.cursor = 'not-allowed';
        googleSignInBtn.title = 'Google Sign-In not configured. Please use email/password.';
    }
    
    if (googleSignUpBtn) {
        googleSignUpBtn.disabled = true;
        googleSignUpBtn.style.opacity = '0.5';
        googleSignUpBtn.style.cursor = 'not-allowed';
        googleSignUpBtn.title = 'Google Sign-In not configured. Please use email/password.';
    }
}

function triggerGoogleSignIn() {
    console.log('Triggering Google Sign-In...');
    
    if (typeof google === 'undefined' || !google.accounts) {
        console.error('❌ Google Sign-In SDK not loaded');
        alert('Google Sign-In is not available. Please use email/password to sign in instead.');
        return;
    }
    
    try {
        // Use renderButton instead of prompt to avoid FedCM warnings
        google.accounts.id.renderButton(
            document.getElementById('google-signin-btn') || document.body,
            {
                type: 'standard',
                size: 'large',
                text: 'signin',
                locale: 'en',
                error_callback: () => {
                    console.error('Google Sign-In button rendering failed');
                    alert('Google Sign-In is not properly configured.\n\nPlease use email/password instead.\n\nTo enable Google OAuth:\n1. Go to Google Cloud Console\n2. Create an OAuth 2.0 Client ID\n3. Add http://localhost:4173 to authorized origins\n4. Update GOOGLE_CLIENT_ID in auth.js');
                }
            }
        );
        
        // Alternatively, try the one-tap UI which is more reliable
        google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed()) {
                console.log('One-tap prompt not displayed');
            } else if (notification.isSkippedMoment()) {
                console.log('User dismissed the sign-in prompt');
            }
        });
    } catch (error) {
        console.error('Error triggering Google Sign-In:', error);
        alert('Google Sign-In error: ' + error.message + '\n\nPlease use email/password instead.');
    }
}

async function handleGoogleSignIn(response) {
    try {
        // Decode the JWT credential
        const credential = response.credential;
        const payload = parseJwt(credential);
        
        console.log('Google Sign-In successful:', payload);

        // Send credential to backend for verification and cookie-based auth
        const result = await fetch('http://localhost:5000/api/auth/google-signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ 
                credential,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                google_id: payload.sub
            })
        });

        const data = await result.json();

        if (!result.ok) {
            throw new Error(data.error || 'Google Sign-In failed');
        }

        if (data.user) {
            localStorage.setItem('careersync_user', JSON.stringify(data.user));
        }
        if (data.token) {
            localStorage.setItem('careersync_token', data.token);
        }

        console.log('Google Sign-In successful, redirecting...');
        setTimeout(() => {
            window.location.href = getPostLoginUrl(data.user);
        }, 100);
    } catch (error) {
        console.error('Error handling Google Sign-In:', error);
        alert('Failed to sign in with Google: ' + error.message + '. Please try email/password instead.');
    }
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
}

