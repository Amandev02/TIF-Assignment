require('dotenv').config();


const jwt = require("jsonwebtoken");
const User = require("../models/User");
const keysecret = process.env.SECRET_KEY;

const authenticate = async(req,res,next)=>{

    try {

        const token = req.cookies.usercookie;
        
        const verifytoken = jwt.verify(token,keysecret);
        console.log(verifytoken.id);
        const rootUser = await User.findOne({_id:verifytoken.id});
        console.log(rootUser);
        
        if(!rootUser) {throw new Error("user not found")}
        
       
        req.token = token
        req.rootUser = rootUser
        req.userId = rootUser._id

        next();

    } catch(errot){
        res.status(401).json({status:401,message:"Unauthorized no token provide"})
    }
}

//check current user
// const checkUser = (req,res,next) => {
//     const token = req.cookies.jwt;
//     if(token){

//     }
//     else{

//     }
// }

module.exports = authenticate