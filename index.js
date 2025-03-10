require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const jwt = require("jsonwebtoken");
const {UserModel, TodoModel} = require("./db");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const port = process.env.port;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const mongo_url = process.env.MONGO_URI;
const sender_email = process.env.sender_email;
const sender_pass = process.env.sender_pass;


const { z } = require("zod");
console.log("JWT_SECRET_KEY:", process.env.JWT_SECRET_KEY);
mongoose.connect(mongo_url);


app.use(express.json());
app.post('/signup', async (req, res)=>{
    const requiredBody = z.object({
        email: z.string().min(3).max(100).email(),
        name : z.string().min(3).max(100),
        password : z.string().min(5)
    })


    //  const parsedData = requiredBody.parse(req.body);
    const parsedDatawithSuccess = requiredBody.safeParse(req.body);

    if(!parsedDatawithSuccess.success){
        res.json({
            message : "Incorrect format",
            error : parsedDatawithSuccess.error
        })
        return;
    }
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    const name = req.body.name;

    // Sending mail
    const transporter = nodemailer.createTransport({
        service : "gmail",
        // host: for some services such as zoho, yahhoo
        // port: for some services such as zoho, yahhoo 465, // ✅ Use port 465 for Yahoo with `secure: true`
        //secure: true, for some services such as zoho, yahhoo
        //secure: false, // true for port 465, false for other ports for some services such as zoho, yahhoo
        auth: {
            user: sender_email,
            pass: sender_pass,

        },
      });
      let otp = Math.floor(Math.random()*1000000);
      // async..await is not allowed in global scope, must use a wrapper
      async function main() {
        // send mail with defined transport object
        const info = await transporter.sendMail({
          from: `"Listify!" <${sender_email}>` , // sender address
          to: email, // list of receivers
          subject: "OTP from Listify!", // Subject line
          
          text: `${otp} is your otp. Thanks for signing up on Listify!`, // plain text body
          
        });
      
        console.log("Message sent: " + email + info.messageId);
    }
    main();


    let errorThrown = false;

    try{
        await UserModel.create({
            email : email,
            password : hashedPassword,
            name : name
        })
        res.json({
            message : "You have signed up successfully"
        })
    } catch (e){
        errorThrown = true;
    }
    if (errorThrown){
        res.json({
            message : "You are already signed up!"
        })
    }
});

    


app.post('/login', async (req, res)=>{
    const email = req.body.email;
    const password = req.body.password;
    
    const user  = await UserModel.findOne({
        email : email
    })
    if(!user){
        res.json({
            message : "No user exists with this mail id."
        })
    }
    console.log(user);
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch){
        const token = jwt.sign({
            id: user._id.toString()
        },JWT_SECRET_KEY)
        
        res.json({
             token : token
        })
    } else{
        res.status(403).json({
            message : "Incorrect Password"
        })
    }
});
app.post('/todo', auth, (req, res)=>{
    const userId = req.userId;
    res.json({
        userId : userId
    })
});
app.get('/todos', auth, async (req, res)=>{
    const userId = req.userId;
    const title = req.headers.title;
    const done = req.headers.done;

    await TodoModel.create({
        title : title,
        done : done,
        userId : userId
    })
    res.json({
        userId : userId
    })
});
function auth (req, res, next){
    const token = req.headers.token;
    const decodedData = jwt.verify(token, JWT_SECRET_KEY);
    if(decodedData){
        req.userId = decodedData.id;
        next();
    } else {
        res.status(403).json({
            message : "Wrong credentials!"
        })
    }
}
app.listen(port, console.log(`App is running on the port no. ${port}`));