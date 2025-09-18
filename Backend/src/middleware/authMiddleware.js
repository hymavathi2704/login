require("dotenv").config();
const { expressjwt: jwt } = require("express-jwt");

const authenticate = jwt({
  secret: process.env.JWT_SECRET,  // ✅ Use your own secret
  algorithms: ["HS256"],           // ✅ Must match how you sign in signAccessToken
  requestProperty: "user"
});

module.exports = { authenticate };
