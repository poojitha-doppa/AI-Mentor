import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify JWT from HttpOnly cookie
 * Attaches user object to req.user if authenticated
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies.Career_Sync_token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('email name role');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: user.role === 'admin'
    };

    req.session = {
      sessionId: decoded.sessionId,
      role: decoded.role,
      isAdmin: Boolean(decoded.isAdmin)
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token exists, but doesn't block request
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies.Career_Sync_token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('email name role');
      
      if (user) {
        req.user = {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isAdmin: user.role === 'admin'
        };

        req.session = {
          sessionId: decoded.sessionId,
          role: decoded.role,
          isAdmin: Boolean(decoded.isAdmin)
        };
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }
  
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access Denied' });
  }

  return next();
};
