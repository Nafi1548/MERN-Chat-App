import { generateToken } from "../lib/utils.js"
import User from "../models/user.models.js"
import bcrypt from 'bcryptjs'
import cloudinary from "../lib/cloudinary.js"

export const signup = async(req,res)=>{
    const {fullName, email, password} = req.body
    try {
        // console.log(password);
        if(!fullName || !email || !password) return res.status(400).json({
            message: "Please fill in all fields"
        })
        if(password.length<4){
            return res.status(400).json({message:"Password small"})
        }

        const user = await User.findOne({email})

        if(user) return res.status(400).json({message:"Duplicate Email"})

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        const newUser = new User({
            fullName,
            email,
            password:hashedPassword
        })
        if(newUser){
            generateToken(newUser._id, res)
            await newUser.save()

            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic: newUser.profilePic
            })
        }
        else{
            res.status(400).json({message:"Invalid User Data"})
        }
    } catch (error) {
        console.log("error in signup",error.message);
        res.status(501).json({message:"Internal error"})

    }
}

export const login = async(req,res)=>{
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});

        // console.log("Invalid credentials");
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
          }

        const isValidPassword = await bcrypt.compare(password,user.password);

        if(!isValidPassword) return res.status(400).json({message:"Invalid credentials"})

        generateToken(user._id, res)
        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
        })

    }catch(error){
        console.log("Error while l0gin", error.message);
        res.status(500).json({message:"Internal error"});  
    }
}

export const logout = (req,res)=>{
    try{
        res.cookie("jwt","", {maxAge:0})
        res.status(200).json({message:"logout successful"})
    }catch(e){
        console.log("Error while logout",error.message);
        res.status(500).json({message:"Internal error"});
    }
}
 
export const updateProfile = async(req, res) => {
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;
        if(!profilePic){
            return res.status(400).json({message:"No profile Pic"})
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId,{profilePic: uploadResponse.secure_url}, {new:true})

        res.status(200).json(updatedUser)
    } catch (error) {
        console.log("Error while updating profile", error.message);
        res.status(500).json({message:"Internal error"});
    }
}

export const checkAuth = (req, res)=>{
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error while checking auth", error.message);
        res.status(500).json({message:"Internal error"});
    }
}