const jwt = require('jsonwebtoken')

const Authentication = (req, res, next) => {
  // Get token from headers
  const token = req.headers.authorization;

  // Check if token exists
  if (!token)
    return res.status(401).send({ auth: false, message: "No token provided." });

  // Extract token from "Bearer token" format
  const bearerToken = token.split(" ")[1];

  // Check if token exists
  if (!bearerToken)
    return res.status(401).send({ auth: false, message: "No token provided." });

  // Verify token
  jwt.verify(bearerToken, "iweufhwedjlwejkdlwkjed", (err, decoded) => {
    if (err)
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });

    // Save decoded user id in request object
    req.userId = decoded.id;
    next();
  });
};

module.exports=Authentication;