const router=require("express").Router();
const User=require("../models/User")
const bcrypt=require('bcrypt')
const jwt=require("jsonwebtoken")

router.get("/",(req,res)=>{
    res.send("hey it's user routes")
})

const verify = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
  
      jwt.verify(token, "mySecretKey", (err,user) => {
        if (err) {
          return res.status(403).json("Token is not valid!");
        }
  
        req.user = user;
        next();
      });
    } else {
      res.status(401).json("You are not authenticated!");
    }
  };
//update user
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
      if (req.body.password) {
        try {
          const salt = await bcrypt.genSalt(10);
          req.body.password = await bcrypt.hash(req.body.password, salt);
        } catch (err) {
          return res.status(500).json(err);
        }
      }
      try {
        const user = await User.findByIdAndUpdate(req.params.id, {
          $set: req.body,
        });
        res.status(200).json("Account has been updated");
      } catch (err) {
        return res.status(500).json(err);
      }
    } else {
      return res.status(403).json("You can update only your account!");
    }
  });
//delete user
router.delete("/:id",verify,(req,res)=>{
    if(req.user.id === req.params.id || req.user.IsAdmin){
        res.status(200).json("user has been deleted")
    }
    else{
        res.status(403).json("you are not allowed to delete this user")
    }
})

//get a user

router.get("/:id",async(req,res)=>{
    try{
       const user=await User.findById(req.params.id);
       const {password,updateAt,...other}=user._doc
       res.status(200).json(other)
    }catch(err){
        res.status(500).json(err)

    }
})

//follow a user 

router.put("/:id/follow",async(req,res)=>{
    if(req.body.userId!== req.params.id){
        try{
            const user= await User.findById(req.params.id);
            const currentUser= await User.findById(req.body.userId)
            console.log('hi')
            if(!user.followers.includes(req.body.userId)){
                await user.updateOne({$push:{followers:req.body.userId}})
                await currentUser.updateOne({$push:{followings:req.params.id}})
                console.log('hi')
                res.status(200).json("user has been followed")
            }else{
                res.status(403).json("you already follow this user")
            }

        }
        catch(err){
            res.status(505).json(err)
        }

    }else{
        res.status(403).json("You can't follow yourself")

    }

})
//unfollow a user

router.put("/:id/unfollow",async(req,res)=>{
    if(req.body.userId!== req.params.id){
        try{
            const user= await User.findById(req.params.id);
            const currentUser= await User.findById(req.body.userId)
            console.log('hi')
            if(user.followers.includes(req.body.userId)){
                await user.updateOne({$pull:{followers:req.body.userId}})
                await currentUser.updateOne({$pull:{followings:req.params.id}})
                console.log('hi')
                res.status(200).json("user has been unfollowed")
            }else{
                res.status(403).json("you don't follow this user")
            }

        }
        catch(err){
            res.status(505).json(err)
        }

    }else{
        res.status(403).json("You can't unfollow yourself")

    }

})


module.exports = router