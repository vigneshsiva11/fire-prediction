import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import LoginLog from '../models/LoginLog.js';

const TOKEN_COOKIE_NAME = 'token';
const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables.');
  }

  return secret;
}

function signToken(admin) {
  return jwt.sign(
    {
      id: admin._id,
      username: admin.username,
      role: admin.role,
    },
    getJwtSecret(),
    {
      expiresIn: '24h',
    },
  );
}

function setAuthCookie(res, token) {
  res.cookie(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: TOKEN_MAX_AGE_MS,
  });
}

function clearAuthCookie(res) {
  res.clearCookie(TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}

export async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.',
    });
  }

  try {
    const admin = await Admin.findOne({ username: String(username).trim() });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const previousLastLogin = admin.lastLogin || null;

    admin.lastLogin = new Date();
    await admin.save();

    await LoginLog.create({
      username: admin.username,
      ipAddress: req.ip || req.socket?.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    const token = signToken(admin);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        lastLogin: previousLastLogin,
      },
    });
  } catch (error) {
    console.error('Login failed:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
    });
  }
}

export async function logout(_req, res) {
  clearAuthCookie(res);

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}

export async function me(req, res) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized.',
    });
  }

  try {
    const admin = await Admin.findById(req.user.id).select('-password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        lastLogin: admin.lastLogin || null,
      },
    });
  } catch (error) {
    console.error('Session verification failed:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Internal server error during session verification.',
    });
  }
}
