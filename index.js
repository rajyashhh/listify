const express = require("express");
const app = express();
app.use(express.json());
app.post('/signup', (req, res)=>{

});
app.post('/login', (req, res)=>{

});
app.post('/todo', (req, res)=>{

});
app.get('/todos', (req, res)=>{

});

app.listen(3000, console.log("App is running on the port 3000"));