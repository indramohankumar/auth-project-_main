const nodemailer=require('nodemailer');
const sendEmail=async(to,subject,text)=>{
    try{
        const transporter=nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from:process.env.EMAIL_USER,
            to,
            subject,
            text
        });
        console.log("email sent successfully");
    }catch(err){
        console.log("error sending email",err);

    }
};
module.exports=sendEmail;