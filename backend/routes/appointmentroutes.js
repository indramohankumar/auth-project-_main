const express=require('express');
const Appointment=require('../models/appointment');
const authmiddleware=require('../middleware/authmiddleware');
const router=express.Router();
//create appointment
router.post('/',authmiddleware,async(req,res)=>{
    try{
        const createdAppointment=await Appointment.create(req.body);
        res.status(201).json({
            message:"appointment created successfully",
            appointment:createdAppointment
        });
    }catch(err){
        res.status(500).json({
            message:"error creating appointment",
            error:err.message
        })
    }
});
//get all appointments
router.get('/',authmiddleware,async(req,res)=>{
    try{
        const appointments=await Appointment.find()
        .populate('visitor')
        .populate('host',"name email role");
        res.status(200).json({
            message:"appointments fetched successfully",
            appointments
        });
    }catch(err){
        res.status(500).json({
            message:"error fetching appointments",
            error:err.message
        })
    }
});
//approve or reject appointment
router.put('/:id',authmiddleware,async(req,res)=>{
    try{
        const appointment=await Appointment.findByIdAndUpdate(
            req.params.id,
            {
                status:"approved"
            },
            {new:true}
        );
            res.status(200).json({
                message:"appointment approved successfully",
                appointment
            });
        
    }catch(err){
        res.status(500).json({
            message:"error approving appointment",
            error:err.message
        })
    }
});

module.exports=router;
