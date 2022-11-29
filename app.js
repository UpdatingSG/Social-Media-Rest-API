const express=require("express");
const app=express();
const mongoose=require('mongoose');
const helmet=require('helmet')
const dotenv=require('dotenv')
const morgan=require('morgan')
const userRoute=require('./routes/user')
const authRoute=require('./routes/auth')
const postRoute=require('./routes/posts')
const jwt= require('jsonwebtoken')

//to use env
dotenv.config()

mongoose.connect(process.env.MONGO_URL,{useNewUrlParser:true},()=>{
    console.log("Connected to MONGODB")
});

//middleware
app.use(express.json())
app.use(helmet())
app.use(morgan("common"))

 app.use("/api/users",userRoute)
 app.use("/api/auth",authRoute)
 app.use("/api/posts",postRoute)
 


// app.get("/",(req,res)=>{
//     res.send('Welcome to Homepage')
// })




app.listen(8800,()=>{
    console.log("backend server is ready")
})