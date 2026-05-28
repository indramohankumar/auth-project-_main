const mongoose=require("mongoose");
const visitorschema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        index:true
    },
    phone:{
        type:String,
        required:true
    },
    company:{
        type:String
    },
    purpose:{
        type:String
    },
    host:{
        type:String
    },
    photoUrl:{
        type:String
    },
    checkIn:{
        type:Date
    },
    checkOut:{
        type:Date
    }
},{timestamps:true});
module.exports = mongoose.model("Visitor", visitorschema);
