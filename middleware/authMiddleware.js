const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  let token = req.header("Authorization");
  console.log("Received Authorization Header:", token);

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    token = token.startsWith("Bearer ") ? token.slice(7).trim() : token;
    console.log("Token after removing 'Bearer':", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    if (!decoded.id) {
      return res.status(401).json({ msg: "Invalid token structure" });
    }

    req.user = { id: decoded.id }; // Ensure user ID is stored
    next();
  } catch (err) {
    console.log("Token verification failed:", err.message);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};
