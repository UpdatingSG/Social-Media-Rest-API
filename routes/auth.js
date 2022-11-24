const router=require("express").Router();
const User=require("../models/User");
const bcrypt=require('bcrypt')

//Register
router.post("/register",async(req,res)=>{

    try{
        //generate new password
        const salt= await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password,salt);

        //create new password
        const newUser= new User({
            username:req.body.username,
            email:req.body.email,
            password:hashedPassword
    
        })
        //save user and response
       const user=await newUser.save()
       res.status(200).json(user);
    }catch(err){
        res.status(500).json(err);
    }
    // const user=await new User({
    //  username:"suraj",
    //  email:"suraj123@gmail.com",
    //  password:"123456"

    // })
    // await user.save();
    // res.send("ok")
})

//login
router.post('/login',async(req,res)=>{
    try{
    const user=await User.findOne({email:req.body.email})
    if(!user){
        res.status(404).json("user not found")
    }
    const Validpassword=await bcrypt.compare(req.body.password,user.password)
    if(!Validpassword){
        res.status(404).json("password is incorrect")
    }
    res.status(200).json(user)
    } catch(err){
        res.status(500).json(err);

    }

})


module.exports = router