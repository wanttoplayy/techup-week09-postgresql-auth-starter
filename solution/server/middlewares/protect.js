import jwt from "jsonwebtoken";

export function protect(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      message: "Token is required",
    });
  }

  const token = authorization.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

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