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
const logger=require('./utils/logger');
const app = express();
dotenv.config();
let limiter = (req, res, next) => next(); // Pass-through fallback
try {
    const rateLimit = require('express-rate-limit');
    limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: 'Too many requests from this IP' }
    });
} catch (e) {
    logger.info("express-rate-limit is not installed locally. Bypassing rate limiting.");
}

const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173'];

app.use(express.json());
app.use(limiter);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/passes", passroutes);
app.use("/api/check", checkroutes);
//console.log("URI IS:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    logger.info("connected to database");
})
.catch((err)=>{
    logger.error("error connecting to database: %s", err.message);
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
    logger.info(`server is running on port ${PORT}`);
});