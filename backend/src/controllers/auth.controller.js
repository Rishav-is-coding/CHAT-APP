import { generateToken } from "../lib/utils.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"

export const signup = async (req, res) => {
    const {fullName, email, password , publicKey} = req.body
    try{
        
        if(!fullName || !email || !password){
            res.status(400).json({message : "all fields are required"})
        }

        if(password.length < 6) {
            return res.status(400).json({message : "password must be at least 6 characters"})
        }

        const user = await User.findOne({email})
        //if user already exists
        if(user) return res.status(400).json({message : "user already exists"})
        //hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullName : fullName,
            email : email,
            password : hashedPassword,
            publicKey: publicKey
        })

        if(newUser) {
            //generate jwt token
            generateToken(newUser._id, res)
            await newUser.save()

            res.status(201).json({
                _id : newUser._id,
                fullName:  newUser.fullName,
                email : newUser.email,
                profilePic : newUser.profilePic,
                publicKey: newUser.publicKey
            })
        }else{
            res.status(400).json({message : "invalid user data"})
        }

    }catch(error) {
        console.log("error in signup controller : ", error.message)
        res.status(500).json({message : "intenal server error"})
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body
    try{
        const user = await User.findOne({email})
        if(!user) return res.status(400).json({message : "invalid credentials"})

        const isPasswordCorrect = await bcrypt.compare(password , user.password)
        if(!isPasswordCorrect) {
            return res.status(400).json({message : "invalid credentials"})
        }

        generateToken(user._id , res)

        res.status(200).json({
            _id : user._id,
            fullName : user.fullName,
            email: user.email,
            profilePic : user.profilePic,
            publicKey: user.publicKey
        })
    }catch(error){
        console.log("error in login controller" , error.message)
        res.status(500).json({message : "internal server error"})
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt" , "" , {maxAge : 0})
        res.status(200).json({message :"user logged out succesfully"})
    }catch(error) {
        console.log("error in logout controller : " , error.message)
        res.status(500).json({message : "inernal server error"})
    }
}

export const updateProfile = async (req, res) => {
    try {
        const {profilePic} = req.body;
        const userId = req.user._id

        if(!profilePic){
            res.status(400).json({message : "profile pic not found"})
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        if(!uploadResponse) return res.status(500).json({message : "error while uploading to cloudinary"})
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic : uploadResponse.secure_url} , {new : true})
        res.status(200).json(updatedUser)

    }catch(error) {
        console.log("error in updateProfile controller : " , error.message)
        res.status(500).json({message : "internal server error"})
    }
}

export const checkAuth = (req, res) => {
    try{
        res.status(200).json(req.user)
    }catch(error){
        console.log("Error in checkAuth controller : " , error.message)
        res.status(500).json({message : "internal server error"})
    }
}

export const updatePublicKey = async (req, res) => {
    try {
        const { publicKey } = req.body;
        const userId = req.user._id;

        if (!publicKey) {
            return res.status(400).json({ message: "Public key not found" });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { publicKey }, { new: true });
        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("error in updatePublicKey controller : ", error.message);
        res.status(500).json({ message: "internal server error" });
    }
};