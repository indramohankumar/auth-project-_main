const mongoose=require('mongoose');
const checklogSchema=new mongoose.Schema({
    pass:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Pass',
        required:true
    },
    checkintime:{
        type:Date,
    },
    checkouttime:{
        type:Date,
    },
    scannedby:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }
},{
    timestamps:true
});
module.exports=mongoose.model('CheckLog',checklogSchema);
    