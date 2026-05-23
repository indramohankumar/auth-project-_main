const rolemiddleware=(...roles)=>{
    return (req,res,next)=>{
        //check roles
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                message:"access denied"
            })
        }
        next();
    }
}
module.exports=rolemiddleware;