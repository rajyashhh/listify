const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const {UserModel, TodoModel} = require("./db");
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://yash:hKimiPvfGZjxkpU9@cluster0.yvabp.mongodb.net/")

JWT_SECRET_KEY = "YashCrazy"
app.use(express.json());
app.post('/signup', async (req, res)=>{
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    await UserModel.insert({
        email : email,
        password : password,
        name : name
    })
    res.json({
        message : "You are logged in"
    })
});
app.post('/login', async (req, res)=>{
    const email = req.body.email;
    const password = req.body.password;
    const user  = await UserModel.findOne({
        email : email,
        password : password
    })
    console.log(user);
    if (user){
        const token = jwt.sign({
            id: user._id
        },JWT_SECRET_KEY)
        
        res.json({
             token : token
        })
    } else{
        res.status(403).json({
            message : "Incoreect Credentials"
        })
    }
});
app.post('/todo', (req, res)=>{

});
app.get('/todos', (req, res)=>{

});

app.listen(3001, console.log("App is running on the port 3000"));