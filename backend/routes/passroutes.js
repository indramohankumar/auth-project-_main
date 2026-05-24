const express=require('express');
const qrcode=require('qrcode');
const Pass=require('../models/pass');
const Appointment=require('../models/appointment');
const authmiddleware=require('../middleware/authmiddleware');
const generatePDF=require('../utils/generatepdf');
const sendEmail=require('../utils/sendemail');
const sendSms=require('../utils/sendsms');
const router=express.Router();
//generate pass
router.post('/:appointmentid',authmiddleware,async(req,res)=>{
    try{
        //find appointment
        const foundAppointment =await Appointment.findById(
            req.params.appointmentid
        ).populate('visitor');
        if(!foundAppointment){
            return res.status(404).json({
                message:"appointment not found"
            });
        }
        //appointment should be approved
        if(foundAppointment.status!=="approved"){
            return res.status(400).json({
                message:"appointment is not approved yet"
            });
        }
        //create unique pass number
        const passnumber=`PASS-${Date.now()}`;
        //qr data
        const qrdata=JSON.stringify({
            passnumber,
            visitor:foundAppointment.visitor,
        
    });     //generate qr code
    const qrCodeUrl=await qrcode.toDataURL(qrdata);
    //create pass
    const createdPass=await Pass.create({
        appointment:foundAppointment._id,
        visitor:foundAppointment.visitor,
        qrcode: qrCodeUrl,
        passnumber,
        validtill:new Date(Date.now()+24*60*60*1000) //valid for 24 hours
    });
    await sendEmail(
        foundAppointment.visitor.email,
        "visitor pass generated",
        `your visitor pass ${createdPass.passnumber} has been generated successfully`
    );
        // send SMS if phone available
        if (foundAppointment.visitor.phone) {
            await sendSms(foundAppointment.visitor.phone, `Your visitor pass ${createdPass.passnumber} is ready.`);
        }
    res.status(201).json({
        message:"pass created successfully",
        pass:createdPass
    });
    }catch(err){
        res.status(500).json({
            message:"error creating pass",
            error:err.message
        });
        }
        });
        router.get('/pdf/:passid',authmiddleware,async(req,res)=>{
            try{
                const foundPass=await Pass.findById(req.params.passid)
                if(!foundPass){
                    return res.status(404).json({
                        message:"pass not found"
                    });
                }
                generatePDF(foundPass,res);
            }catch(err){
                res.status(500).json({
                    message:"error generating PDF", 
                    error:err.message
                });
            }
        });
        router.get('/public/pdf/:passnumber',async(req,res)=>{
            try{
                const foundPass=await Pass.findOne({ passnumber: req.params.passnumber });
                if(!foundPass){
                    return res.status(404).json({
                        message:"pass not found"
                    });
                }
                generatePDF(foundPass,res);
            }catch(err){
                res.status(500).json({
                    message:"error generating PDF", 
                    error:err.message
                });
            }
        });

module.exports=router;