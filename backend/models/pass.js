const mongoose =require('mongoose');
const visitor = require('./visitor');
const passschema=new mongoose.Schema({
    appointment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Appointment',
        required:true
    },
    visitor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Visitor',
        required:true
    },
    qrcode:{
        type:String,
    },
    passnumber:{
        type:String,
        unique:true
    },
    validtill:{
        type:Date
    },
    status:{
        type:String,
        enum:['active','inactive'],
        default:'active'
    }
},{
    timestamps:true
});
module.exports=mongoose.model('Pass',passschema);