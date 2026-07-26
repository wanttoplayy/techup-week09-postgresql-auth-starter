import jwt from "jsonwebtoken";

export function protect(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token has invalid format",
    });
  }

  const parts = authorization.split(" ");

  if (parts.length !== 2 || !parts[1]) {
    return res.status(401).json({
      message: "Token has invalid format",
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing");
    return res.status(500).json({
      message: "Server authentication is not configured",
    });
  }

  try {
    const payload = jwt.verify(parts[1], process.env.JWT_SECRET);

    req.user = {
      userId: payload.userId,
      username: payload.username,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Token is invalid or expired",
    });
  }
}
