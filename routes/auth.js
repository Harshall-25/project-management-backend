const express = require("express");
const {User} = require('../schema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const z = require('zod');
const authRouter = express.Router();
const {JWT_KEY} = require('../middlewares/authmiddleware')

const signupSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["user", "admin"]).optional()
});

const signinSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

authRouter.post('/signup',async function(req,res){
    try {
        const validation = signupSchema.safeParse(req.body);
        if(!validation.success){
            return res.status(400).json({error: validation.error.errors});
        }
        const {name, email,password,role} = req.body;
        //do validation of the input using zod

        //do hashing of password
        const hashedPassword = await bcrypt.hash(password, 5);

        //email already exists
        const existAlready = await User.findOne({email});
        if(existAlready){
            return res.status(409).json({
                error : "Email already exists"
            });
        }

        await User.create({
            name : name,
            email : email,
            password : hashedPassword,
            role : role
        });

        res.status(201).json({
            message : "Signed up"
        })
    } catch (error) {
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({ 
                error: "Email already exists",
                details: "This email is already registered"
            });
        }
        res.status(500).json({ 
            error: "Internal server error",
            details: error.message
        });
    }
})

authRouter.post('/signin',async function(req,res){
    try {
        const validation = signinSchema.safeParse(req.body);
        if(!validation.success){
            return res.status(400).json({error: validation.error.errors});
        }
        const {email,password}  = req.body;

        //checking if user signup is done 
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({
                error:"signup first then login"
            });
        }

        //match password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return res.status(401).json({
                error : "password is incorrect"
            });
        }

        //jwt token
        const token = jwt.sign({
            id : user._id.toString(),
            role : user.role
        },JWT_KEY);

        res.status(200).json({
            success : true,
            message: "Successfull login",
            token : token
        })
    } catch (error) {
        res.status(500).json({ 
            error: "Internal server error",
            details: error.message
        });
    }
})

module.exports = {
    authRouter : authRouter
}