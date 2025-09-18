require("dotenv").config();
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

// ==============================
// Middleware for Local JWT (HS256)
// ==============================
const authenticateLocal = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  requestProperty: "user", // decoded payload will be stored in req.user
  getToken: (req) => {
    if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
      return req.headers.authorization.split(" ")[1];
    }
    return null;
  },
});

// ==============================
// Middleware for Auth0 JWT (RS256)
// ==============================
const authenticateAuth0 = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
  requestProperty: "auth", // decoded token will be stored in req.auth
  getToken: (req) => {
    if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
      return req.headers.authorization.split(" ")[1];
    }
    return null;
  },
});

// ==============================
// Combined Middleware
// ==============================
const authenticate = (req, res, next) => {
  authenticateLocal(req, res, (err) => {
    if (!err) {
      // Local JWT verified successfully
      return next();
    }

    authenticateAuth0(req, res, (err2) => {
      if (err2) {
        // Both failed → unauthorized
        return res.status(401).json({ error: "Unauthorized: Invalid or missing token" });
      }

      // Normalize Auth0 payload to req.user
      req.user = {
        userId: req.auth.sub, // Auth0 `sub` as userId
        email: req.auth.email,
        name: req.auth.name || "",
      };

      next();
    });
  });
};

// ==============================
// Export
// ==============================
module.exports = { authenticate, authenticateLocal, authenticateAuth0 };
