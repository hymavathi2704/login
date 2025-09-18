const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
require("dotenv").config();

const authenticate = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: "https://api.coachflow.com", // same as Auth0 API identifier
  issuer: `https://${process.env.AUTH0_DOMAIN}/`, // must end with /
  algorithms: ["RS256"],
});

module.exports = { authenticate };
