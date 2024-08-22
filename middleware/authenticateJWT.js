const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "sucretky";

function authenticateJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({ message: "Token manquant" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token invalide, vous n'êtes pas autorisé à accéder à cette ressource" });

    req.user = {
      id: user.id,
      email: user.email,
      isOwner: user.isOwner,
    };

    next();
  });
}

module.exports = authenticateJWT;
