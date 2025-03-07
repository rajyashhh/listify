const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const jwt = require("jsonwebtoken");
const {UserModel, TodoModel} = require("./db");
const mongoose = require("mongoose");
const port = 3001;
mongoose.connect("mongodb+srv://yash:hKimiPvfGZjxkpU9@cluster0.yvabp.mongodb.net/listify")

JWT_SECRET_KEY = "YashCrazy"
app.use(express.json());
app.post('/signup', async (req, res)=>{
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 5);
    const name = req.body.name;
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