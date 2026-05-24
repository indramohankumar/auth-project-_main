const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const path=require('path');
const authroutes=require('./routes/authroutes');
const userroutes=require('./routes/userroutes');
const authmiddleware=require('./middleware/authmiddleware');
const rolemiddleware=require('./middleware/rolemiddleware');
const visitorroutes=require('./routes/visitorroutes');
const appointmentroutes=require('./routes/appointmentroutes');
const passroutes=require('./routes/passroutes');
const checkroutes=require('./routes/checkoutroutes');
const dotenv=require('dotenv');
const app=express();
dotenv.config();
app.use(express.json());
app.use(cors()); // Allow all origins for production
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/passes", passroutes);
app.use("/api/check", checkroutes);
//console.log("URI IS:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("connected to database");
})
.catch((err)=>{
    console.log("error connecting to database",err);
});
app.use('/api/auth',authroutes);
app.use('/api/users',userroutes);
app.get('/api/admin',authmiddleware,rolemiddleware('admin'),(req,res)=>{
    res.json({
        message:"welcome admin",
        user:req.user
    });
    })
app.get('/api/protected',authmiddleware,(req,res)=>{
    res.json({
        message:"this is a protected route",
        user:req.user
    });
});
app.use('/api/visitor',visitorroutes);
app.use('/api/appointment',appointmentroutes);



app.get('/',(req,res)=>{
    res.send("server is running");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});