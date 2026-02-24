import jwt from 'jsonwebtoken';

const TOKEN_COOKIE_NAME = 'token';

export function protectRoute(req, res, next) {
  const token = req.cookies?.[TOKEN_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Authentication token missing.',
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      success: false,
      message: 'Server auth configuration missing.',
    });
  }

  try {
    const decoded = jwt.verify(token, secret);

    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };

    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or expired token.',
    });
  }
}
