const jwt = require("jsonwebtoken");
// const blacklistedTokens = require("../controller/user");
const authMiddleware = (req, res, next) => {

  const authheader = req.header("Authorization");
  if (!authheader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
//   if (blacklistedTokens.includes(token)) {
//     return res.status(401).json({ message: "Token revoked" });
//   }
const token = authheader.split(' ')[1];

  try {
    const decodedValue = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("decoded user value",decodedValue.id)
    // req.userId = decodedValue.id;
    
    req.user = decodedValue;
  
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
};

const authorizationMiddleware = (req,res,next) =>{
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
}
module.exports = {authMiddleware,authorizationMiddleware};
