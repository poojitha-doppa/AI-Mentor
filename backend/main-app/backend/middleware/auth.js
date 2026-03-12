import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify JWT from HttpOnly cookie
 * Attaches user object to req.user if authenticated
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.Career_Sync_token;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('email name');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      name: user.name
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
    const token = req.cookies.Career_Sync_token;
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('email name');
      
      if (user) {
        req.user = {
          id: user._id,
          email: user.email,
          name: user.name
        };
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }
  
  next();
};
