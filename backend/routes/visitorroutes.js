const express=require('express');
const multer=require('multer');
const Visitor =require('../models/visitor');
const authmiddleware=require('../middleware/authmiddleware');

const router=express.Router();
const upload=multer({storage:multer.memoryStorage()});

//create visitor
router.post('/',authmiddleware,upload.single('photo'),async(req,res)=>{
    try{
        const visitor=await Visitor.create(req.body);
        res.status(201).json({
            message:"visitor created successfully",
            visitor
        });
    }catch(err){
        res.status(500).json({
            message:"error creating visitor",
            error:err.message
        });
    }
});

//get all visitors 
router.get('/',authmiddleware,async(req,res)=>{
    try{
        const visitors=await Visitor.find();
        res.status(200).json({
            message:"visitors fetched successfully",
            visitors
        });
    }catch(err){  
        res.status(500).json({
            message:"error fetching visitors",
            error:err.message
        });
    }
});

//get single visitor
router.get('/:id',authmiddleware,async(req,res)=>{
    try{
        const visitor=await Visitor.findById(req.params.id);
        if(!visitor){
            return res.status(404).json({
                message:"visitor not found"
            });
        }
        res.status(200).json({
            message:"visitor fetched successfully",
            visitor
        });
    }catch(err){
        res.status(500).json({
            message:"error fetching visitor",
            error:err.message
        });
    }
});

//update visitor
router.put('/:id',authmiddleware,upload.single('photo'),async(req,res)=>{
    try{
        const updatedvisitor=await Visitor.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        );
        res.status(200).json({
            message:"visitor updated successfully",
            visitor:updatedvisitor
        });
    }catch(err){
        res.status(500).json({
            message:"error updating visitor",
            error:err.message
        });
    }
});

//delete visitor
router.delete('/:id',authmiddleware,async(req,res)=>{
    try{
        await Visitor.findByIdAndDelete(req.params.id);
        res.status(200).json({
            message:"visitor deleted successfully"
        });
    }catch(err){
        res.status(500).json({
            message:"error deleting visitor",
            error:err.message
        });
    }
});

module.exports=router;