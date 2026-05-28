const mongoose=require('mongoose');
const userschema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        index:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["admin","employee","security"],
        default:"employee"
    }
})
module.exports=mongoose.model("User",userschema);