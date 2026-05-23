const jwt=require("jsonwebtoken");
const authmiddleware=async(req, res, next)=>{
    try{
        //get tokens from headers
        const token=req.headers.authorization;
        if(!token){
            return res.status(401).json({
                message:"no token provided"
            });
            
        }
        //reove bearer from token
        const actualtoken=token.split(" ")[1];
        //verify token

        const decoded=jwt.verify(
            actualtoken,
            process.env.JWT_SECRET
        );
        req.user=decoded;
        next();
    }catch(error){
        res .status(401).json({
            message:"invalid token"
        });
    }
};
module.exports=authmiddleware;