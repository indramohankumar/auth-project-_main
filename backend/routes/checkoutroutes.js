const express=require('express');
const pass =require('../models/pass');
const CheckLog=require('../models/checklogs');
const authmiddleware=require('../middleware/authmiddleware');
const router=express.Router();

// Helper to find pass by either ID or passnumber
const findPass = async (idOrPassNumber) => {
    // If it looks like a Mongo ID (24 hex chars)
    if (idOrPassNumber.match(/^[0-9a-fA-F]{24}$/)) {
        return await pass.findById(idOrPassNumber);
    }
    // Otherwise, search by the string passnumber
    return await pass.findOne({ passnumber: idOrPassNumber });
};

//check in
router.post('/checkin/:passid',authmiddleware,async(req,res)=>{
    try{
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "only admin can check in visitors" });
        }
        const foundPass=await findPass(req.params.passid);
        if(!foundPass){
            return res.status(404).json({   
                message:"pass not found"
            });
        }
        //create check log
        const log=await CheckLog.create({
            pass:foundPass._id,
            checkintime:new Date(),
            scannedby:req.user.id
        });
        res.status(200).json({
            message:"check in successful",
            log
        });
    }catch(err){
        res.status(500).json({
            message:"error during check in",
            error:err.message
        });
    }
});
//check out
router.post('/checkout/:passid',authmiddleware,async(req,res)=>{
    try{
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "only admin can check out visitors" });
        }
        const foundPass=await findPass(req.params.passid);
        if(!foundPass){
            return res.status(404).json({
                message:"pass not found"
            });
        }
        const log=await CheckLog.findOne({
            pass:foundPass._id,
            checkouttime:null
        }).sort({ checkintime:-1 });
        if(!log){
            return res.status(404).json({
                message:"no active check-in found for this pass"
            });
        }
        log.checkouttime=new Date();
        await log.save();
        res.status(200).json({
            message:"check out successful",
            log
        });
    }catch(err){
        res.status(500).json({
            message:"error during check out",
            error:err.message
        });
    }
});

module.exports=router;
