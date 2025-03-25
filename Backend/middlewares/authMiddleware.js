import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("No token provided in request");
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log("Token verification failed:", token);
      return res.status(401).json({ message: "Invalid token." });
    }
    req.user = decoded;
    console.log("Token decoded successfully:", decoded); // Debug log
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).json({ message: "Authentication failed." });
  }
};

export default authMiddleware;
