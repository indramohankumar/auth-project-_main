const express=require('express');
const Appointment=require('../models/appointment');
const authmiddleware=require('../middleware/authmiddleware');
const validateRequest = require('../middleware/validationMiddleware');
const { appointmentSchema } = require('../validation/schemas');
const rolemiddleware=require('../middleware/rolemiddleware');
const router=express.Router();
//create appointment
router.post('/', authmiddleware, validateRequest(appointmentSchema), async(req,res)=>{
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
        .populate('host',"name email role")
        .populate('statusHistory.changedBy', 'name email role');
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
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: 'invalid appointment status'
            });
        }

        const appointmentToUpdate = await Appointment.findById(req.params.id);
        if (!appointmentToUpdate) {
            return res.status(404).json({
                message: 'appointment not found'
            });
        }

        // Only Admin can approve/reject it
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'only admin is authorized to approve or reject appointments'
            });
        }

        const appointment=await Appointment.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    status,
                },
                $push: {
                    statusHistory: {
                        status,
                        changedAt: new Date(),
                        changedBy: req.user.id,
                        changedByRole: req.user.role,
                    }
                }
            },
            {new:true}
        );

        if (!appointment) {
            return res.status(404).json({
                message: 'appointment not found'
            });
        }

            res.status(200).json({
                message:`appointment ${status} successfully`,
                appointment
            });
        
    }catch(err){
        res.status(500).json({
            message:"error approving appointment",
            error:err.message
        })
    }
});

//delete appointment
router.delete('/:id', authmiddleware, rolemiddleware('admin'), async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) {
            return res.status(404).json({
                message: "appointment not found"
            });
        }
        res.status(200).json({
            message: "appointment deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: "error deleting appointment",
            error: err.message
        });
    }
});

module.exports = router;
