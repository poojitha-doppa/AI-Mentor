import express from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import { sendOtpEmail } from '../services/email.js';
import { getDeviceInfo, generateSessionId } from '../utils/deviceDetector.js';
import { normalizeEmail, isAdminEmail, ensureAdminRole } from '../config/admin.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-domain in production
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
};

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to set auth cookie
function setAuthCookie(res, token) {
  res.cookie('Career_Sync_token', token, COOKIE_OPTIONS);
}

function buildSessionPayload(user, sessionId) {
  return {
    id: user._id,
    email: user.email,
    role: user.role,
    isAdmin: user.role === 'admin',
    ...(sessionId ? { sessionId } : {})
  };
}

// Register/Signup endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcryptjs.hash(password, 10);
    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      name,
      phone,
      role: isAdminEmail(normalizedEmail) ? 'admin' : 'user'
    });

    const token = jwt.sign(buildSessionPayload(user), JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, token);
    res.json({ 
      message: 'User registered successfully',
      token: token, // Include token for cross-domain navigation
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Alias for signup
router.post('/signup', async (req, res) => {
  return router.handle(Object.assign(req, { url: '/register', originalUrl: '/api/auth/signup' }), res);
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password, deviceInfo } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcryptjs.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await ensureAdminRole(user);

    // Capture device information from request
    const detectedDeviceInfo = await getDeviceInfo(req);
    const mergedDeviceInfo = { ...detectedDeviceInfo, ...deviceInfo };

    // Record device login and sync credentials
    await user.recordDeviceLogin(mergedDeviceInfo);

    const sessionId = generateSessionId();
    const token = jwt.sign(buildSessionPayload(user, sessionId), JWT_SECRET, { expiresIn: '7d' });

    setAuthCookie(res, token);
    
    // Return user data with token (for cross-domain localStorage auth) and device sync info
    res.json({ 
      message: 'Login successful',
      token: token, // Include token for cross-domain navigation
      user: user.toSafeObject(),
      devices: user.getActiveDevices(),
      sessionId,
      lastSyncAt: user.lastProfileUpdateAt
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Request OTP (email) for login
router.post('/request-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    const otp = generateOtp();
    const otpHash = await bcryptjs.hash(otp, 10);

    user.otpCode = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Respond immediately, send email in background
    res.json({ message: 'OTP sent to email' });

    sendOtpEmail({
      toEmail: normalizedEmail,
      otp,
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID,
      publicKey: EMAILJS_PUBLIC_KEY,
      privateKey: EMAILJS_PRIVATE_KEY,
    }).catch((err) => {
      console.error('Background OTP email send failed:', err.message);
    });
  } catch (error) {
    console.error('OTP request error:', error.message);
    res.status(500).json({ error: 'Failed to send OTP', detail: error.message });
  }
});

// Login with OTP
router.post('/login-otp', async (req, res) => {
  try {
    const { email, otp, deviceInfo } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return res.status(401).json({ error: 'OTP not requested or invalid' });
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      return res.status(401).json({ error: 'OTP expired, request a new one' });
    }

    const isValid = await bcryptjs.compare(otp, user.otpCode);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await ensureAdminRole(user);
    
    // Capture device information from request
    const detectedDeviceInfo = await getDeviceInfo(req);
    const mergedDeviceInfo = { ...detectedDeviceInfo, ...deviceInfo };
    
    // Record device login and sync credentials
    await user.recordDeviceLogin(mergedDeviceInfo);

    const sessionId = generateSessionId();
    const token = jwt.sign(buildSessionPayload(user, sessionId), JWT_SECRET, { expiresIn: '7d' });
    
    setAuthCookie(res, token);
    res.json({
      message: 'Login successful',
      token,
      user: user.toSafeObject(),
      devices: user.getActiveDevices(),
      sessionId,
      lastSyncAt: user.lastProfileUpdateAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify token endpoint
router.post('/verify', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('email name role');
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    await ensureAdminRole(user);
    res.json({ 
      message: 'Token is valid',
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('Career_Sync_token', { path: '/' });
  res.json({ message: 'Logout successful' });
});

// Get current user endpoint (check authentication)
router.get('/me', async (req, res) => {
  try {
    // Check both cookie and Authorization header
    let token = req.cookies.Career_Sync_token;
    
    // If no cookie, check Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('email name role');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    await ensureAdminRole(user);

    res.json({ 
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return res.status(401).json({ error: 'OTP not requested or invalid' });
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      return res.status(401).json({ error: 'OTP expired, request a new one' });
    }

    const isValid = await bcryptjs.compare(otp, user.otpCode);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // Update password
    const passwordHash = await bcryptjs.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await ensureAdminRole(user);
    await user.save();

    // Generate token for auto-login
    const token = jwt.sign(buildSessionPayload(user), JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, token);
    res.json({ 
      message: 'Password reset successful',
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Password reset error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Google Sign-In endpoint
router.post('/google-signin', async (req, res) => {
  try {
    const { credential, email, name, google_id, picture } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!credential || !normalizedEmail) {
      return res.status(400).json({ error: 'Invalid Google credential' });
    }

    // Find or create user
    let user = await User.findByEmail(normalizedEmail);
    
    if (!user) {
      // Create new user from Google data
      user = await User.create({
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        provider: 'google',
        status: 'active',
        role: isAdminEmail(normalizedEmail) ? 'admin' : 'user',
        passwordHash: '', // No password for OAuth users
        metadata: {
          google_id,
          picture,
          oauth: true
        }
      });
    } else if (user.provider !== 'google') {
      // User exists with different provider, update to linked account
      user.metadata = user.metadata || {};
      user.metadata.google_id = google_id;
      user.metadata.picture = picture;
      await user.save();
    }

    await ensureAdminRole(user);

    // Record login
    await user.recordLogin();

    // Generate JWT token
    const token = jwt.sign(buildSessionPayload(user), JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, token);

    res.json({
      message: 'Google Sign-In successful',
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error('Google Sign-In error:', error.message);
    res.status(500).json({ error: 'Google Sign-In failed: ' + error.message });
  }
});

// ============ MULTI-DEVICE SYNC ENDPOINTS ============

// Get all devices for current user
router.get('/devices', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      devices: user.getActiveDevices(),
      syncedAt: user.lastProfileUpdateAt
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Sync user data across all devices
router.post('/sync-devices', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Sync data to all devices
    const syncData = await user.syncToAllDevices();

    res.json({
      message: 'Devices synced successfully',
      ...syncData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile and sync across all devices
router.post('/update-profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, phone, metadata } = req.body;

    // Update credentials
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (metadata) user.metadata = { ...user.metadata, ...metadata };

    // Update across all devices
    await user.updateCredentialsAcrossDevices({ name, phone, metadata });

    res.json({
      message: 'Profile updated across all devices',
      user: user.toSafeObject(),
      devices: user.getActiveDevices(),
      syncedAt: user.lastProfileUpdateAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark device as inactive
router.post('/logout-device', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { deviceId } = req.body;

    // Find and deactivate device
    const deviceIndex = user.devices.findIndex(d => d.deviceId === deviceId);
    if (deviceIndex >= 0) {
      user.devices[deviceIndex].isActive = false;
      await user.save();
    }

    res.json({
      message: 'Device logged out',
      devices: user.getActiveDevices()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout from all devices
router.post('/logout-all-devices', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Deactivate all devices
    user.devices.forEach(device => {
      device.isActive = false;
    });
    user.activeSessions = [];
    await user.save();

    res.json({
      message: 'Logged out from all devices'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
