import { verifyToken } from "../utils/jwt.js";
export const authMiddleware = (req, res, next) => {
  console.log("Full Headers:", req.headers); // Log all headers for debugging
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Authorization Header:", req.headers.authorization);
  console.log("Extracted Token:", token);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token." });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed." });
  }
};
export default authMiddleware;
