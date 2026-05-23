const express=require('express');
//import bcrypt from './../node_modules/bcryptjs/index.d';
const bcryptjs = require('bcryptjs');
const User=require('../models/user');
const router=express.Router();
const jwt=require('jsonwebtoken');
router.post('/register',async(req, res)=>{
    try{
        const {name,email,password,role}=req.body;
        //check existing user
        const existinguser=await User.findOne({email});
        if(existinguser){
            return res.status(400).json({
                message:"user already exists"   
            });
        }
        //hash password
        const hashedpassword=await bcryptjs.hash(password,10);
        //create new user
        const newuser=new User({
            name,
            email,
            password:hashedpassword,
            role

        });
        await newuser.save();
        res.status(201).json({
            message:"user registered successfully",
            user:newuser
        });
    } catch(err){
        res.status(500).json({
            message:"error registering user",
            error:err.message
        });
    }
});
router.post('/login',async(req,res)=>{
    try{
        const {email,password}=req.body;
        //check user
        const foundUser=await User.findOne({email});
        if(!foundUser){
            return res.status(400).json({
                message:"invalid credentials"
            });
        }
        //check password
        const ismatch=await bcryptjs.compare(password,foundUser.password);
        if(!ismatch){
            return res.status(400).json({
                message:"invalid credentials"
            });
        }
        //generate token
        const token =jwt.sign(
            {
                id:foundUser._id,
                role:foundUser.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"3d"
            }
        );
        res.status(200).json({
            message:"login successful",
            token,
            user: foundUser
        });

    }
    catch(err){
        res.status(500).json({
            message:"error logging in",
            error:err.message
        });
    }
})

module.exports=router;


    

