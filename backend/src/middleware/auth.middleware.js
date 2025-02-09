import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export const protectRoute = async(req, res, next)=>{
    try {
        const token = req.cookies.jwt
        // console.log(c );
        
        if(!token){
            return res.status(401).json({message: "You are not logged in" })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if(!decoded){
            return res.status(401).json({message: "Invalid token" })
        }

        const user = await User.findById(decoded.userId).select("-password")
        if(!user){
            return res.status(401).json({message: "User does not exist" })
        }

        req.user = user
        next()
    } catch (error) {
        console.log("Error in protectRoute", error.message);
        return res.status(500).json({message: "Internal server error" })
        
    }
}