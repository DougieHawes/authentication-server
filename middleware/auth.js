const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.header("x-auth-token");

    if (!token) {
      return res.status(401).send({ error: "no token, not authorised" });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    if (!verified) {
      return res.status(401).send({ error: "invalid token, not authorised" });
    }

    req.user = verified.id;

    next();
  } catch (error) {
    res.status(500).msg({ error: error.message });
  }
};

module.exports = auth;
