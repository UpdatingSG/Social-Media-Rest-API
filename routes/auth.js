const router=require("express").Router();
const User=require("../models/User");
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const verify=require('./user')

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


//refresh token

const generateAccessToken=(user)=>{
    return jwt.sign({id:user.id, IsAdmin:user.IsAdmin},"mySecretKey",{expiresIn:'30s'})

}

const generateRefreshToken=(user)=>{
    return jwt.sign({id:user.id, IsAdmin:user.IsAdmin},"myRefreshSecretKey")
}

let refreshtokens=[];
router.post('/refresh',(req,res)=>{
    //take the refresh token from the user
    const refreshtoken=req.body.token

    //send error if there is not token or token is invalid
    if(!refreshtoken){
        return res.status(401).json("you are not authenticated!")
    }
    if(!refreshtokens.includes(refreshtoken)){
        return res.status(403).json("Refresh Token is not valid!")
    }
    jwt.verify(refreshtoken,"myRefreshSecretKey",(err,user)=>{
        if(err) {
            console.log(err)
        };
        refreshtokens=refreshtokens.filter((token)=>token!==refreshtoken)
        const newAccessToken=generateAccessToken(user);
        const newRefreshToken=generateRefreshToken(user);

        refreshtokens.push(newRefreshToken);

        res.status(200).json({
            accessToken:newAccessToken,
            refreshtoken:newRefreshToken

        })
    })

    //if everything is ok,
})



//login


router.post('/login',async(req,res)=>{
    try{
    const user=await User.findOne({email:req.body.email})
    if(!user){
        res.status(404).json("user not found")
    }
    const Validpassword= bcrypt.compare(req.body.password, user.password)
    if(!Validpassword){
        res.status(404).json("password is incorrect")
    }

       if(user){
        //genrate an access token
       const accessToken=generateAccessToken(user);
       const refreshtoken=generateRefreshToken(user);
       
        refreshtokens.push(refreshtoken);
        res.status(200).json({
            username:user.username,
            IsAdmin:user.IsAdmin,
            accessToken,
            refreshtoken
        
        })}
         else{
            res.status(400).json("Username or password incorrect!");
         }
    } catch(err){
        res.status(500).json(err);

    }

})

//logout
router.post('/logout',verify,(req,res)=>{
    const refreshToken=req.body.token;
    refreshtokens=refreshtokens.filter((token)=>token!==refreshToken);
    res.status(200).json("logged out successfully")
})

// const verify=(req,res,next)=>{
//     const authHeader=req.headers.authorization;
//     if(authHeader){
//         const token=authHeader.split("")[1]
//         jwt.verify(token,"mysecretkey",(err,user)=>{
//             if(err){
//                 return res.status(403).json("Token is not valid")
//             }
//             req.user=user;
//             next();
//         })

//     }else{
//         res.status(401).json("you are not authenticated")
//     }
// }

// a.delete("/api/users/:userId",verify,(req,res)=>{
//     if(req.user.id === req.params.userId || req.user.IsAdmin){
//         res.status(200).json("user has been deleted")
//     }
//     else{
//         res.status(403).json("you are not allowed to delete this user")
//     }
// })

module.exports = router