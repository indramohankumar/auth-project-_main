const express=require('express');
const multer=require('multer');
const fs=require('fs');
const path=require('path');
const Visitor =require('../models/visitor');
const Appointment = require('../models/appointment');
const authmiddleware=require('../middleware/authmiddleware');

const router=express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname) || '.jpg';
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        cb(null, uniqueName);
    },
});

const upload=multer({
    storage,
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    },
});

const buildPhotoUrl = (file) => {
    if (!file) {
        return undefined;
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}/uploads/${file.filename}`;
};

const removePhotoFile = (photoUrl) => {
    if (!photoUrl) {
        return;
    }

    try {
        const fileName = path.basename(new URL(photoUrl).pathname);
        const filePath = path.join(uploadsDir, fileName);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (_error) {
        // Ignore cleanup errors for external or malformed URLs.
    }
};

//public register visitor
router.post('/public-register', upload.single('photo'), async(req,res)=>{
    try{
        const visitorData = { ...req.body };
        const photoUrl = buildPhotoUrl(req.file);
        if (photoUrl) {
            visitorData.photoUrl = photoUrl;
        }

        const visitor = await Visitor.create(visitorData);
        
        if(req.body.hostId && req.body.purpose && req.body.visitdate) {
            await Appointment.create({
                visitor: visitor._id,
                host: req.body.hostId,
                purpose: req.body.purpose,
                visitdate: new Date(req.body.visitdate),
                status: 'pending'
            });
        }

        res.status(201).json({
            message:"visitor pre-registered successfully",
            visitor
        });
    }catch(err){
        res.status(500).json({
            message:"error pre-registering visitor",
            error:err.message
        });
    }
});

//create visitor
router.post('/',authmiddleware,upload.single('photo'),async(req,res)=>{
    try{
        const visitorData = {
            ...req.body,
        };

        const photoUrl = buildPhotoUrl(req.file);
        if (photoUrl) {
            visitorData.photoUrl = photoUrl;
        }

        const visitor=await Visitor.create(visitorData);
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
        const existingVisitor = await Visitor.findById(req.params.id);
        if (!existingVisitor) {
            return res.status(404).json({
                message:"visitor not found"
            });
        }

        const updateData = {
            ...req.body,
        };

        const photoUrl = buildPhotoUrl(req.file);
        if (photoUrl) {
            updateData.photoUrl = photoUrl;
            removePhotoFile(existingVisitor.photoUrl);
        }

        const updatedvisitor=await Visitor.findByIdAndUpdate(
            req.params.id,
            updateData,
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
        const deletedVisitor = await Visitor.findByIdAndDelete(req.params.id);
        removePhotoFile(deletedVisitor?.photoUrl);
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