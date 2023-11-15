const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt =require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('./schema/User')
mongoose.set("strictQuery", false)
const bodyParser = require('body-parser')
require('dotenv').config()
mongoose.set("strictQuery", false);
const secretKEY = 'dodomyg'
const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(express.json())
const PORT = 5000

mongoose.connect(process.env.MONGODB_URI).then(()=>{
    app.listen(PORT,()=>{
        console.log(`backend is running on port 5000 and mongo db connected`);
    })
}).catch((err)=>{
    console.log(err)
})

//signup
app.post('/register',async(req,resp)=>{
    try {
        const {username,email,password}=req.body
        const hashedPw = await bcrypt.hash(password,10)
        const newUser = new User({username,email,password:hashedPw})
        await newUser.save()
        resp.status(201).json({message : "New user created"})
    } catch (error) {
        resp.status(500).json({ err : "Error in sign up"})
    }
})
//login
app.post('/login',async(req,resp)=>{
    try {
        const {email,password} = req.body
        const user = await User.findOne({email})
        if(!user){
           return  resp.status(401).json({error : "Invalid credentials"})
        }
        const pwEntered = await bcrypt.compare(password,user.password);
        if(!pwEntered){
           return resp.status(401).json({error : "Incorrect Password"})
        }
        const token = jwt.sign({userId : user._id},secretKEY,{ expiresIn:'10mins'})
        resp.json({message:"Login successful"})
    } catch (error) {
resp.status(500).json({error:"login failed"})
    }
})


