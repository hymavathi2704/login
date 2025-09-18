require("dotenv").config();
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

// ✅ Middleware for local JWT (HS256) users
const authenticateLocal = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  requestProperty: "user",
});

// ✅ Middleware for Auth0 JWT (RS256)
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
  requestProperty: "auth", // store decoded token in req.auth
});

// ✅ Combined middleware (tries local first, then Auth0)
const authenticate = (req, res, next) => {
  authenticateLocal(req, res, (err) => {
    if (!err) return next(); // Local token verified ✅
    authenticateAuth0(req, res, (err2) => {
      if (err2) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }
      next(); // Auth0 token verified ✅
    });
  });
};

module.exports = { authenticate };
