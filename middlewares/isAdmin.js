function adminAuth(req,res,next){
    if(req.user.role !== "admin"){
        return res.status(403).json({
            error : "you are not admin"
        });
    }
    next();
}

module.exports = {
    adminAuth
}