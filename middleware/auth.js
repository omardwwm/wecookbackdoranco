const jwt = require('jsonwebtoken');

const auth = (req, res, next)=>{
    try {
       const token = req.header("x-auth-token");
       console.log("token from front inside auth:", token);
    //    Check si y'a un Token
       if(!token){
           return res.status(401).json({message: 'No token, access refused, vous devez avoir un token pour cette operation'})
       }
       const verified = jwt.verify(token, process.env.JWT_SECRET);
       console.log("verified inside auth: ", verified);
    //    Verifier si le Token est valide
       if(!verified){
        return res.status(401).json({message: 'Token verification failed, Token non Valide, access non autorise'});
       }
       req.user = verified.id;
       next();
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

module.exports = auth;