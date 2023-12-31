const User = require('../models/User');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const keysecret = process.env.SECRET_KEY;

//handle errors
const handleErrors = (err) => {
  let error = {name: '', email: '', password: ''};



  //validation errors
  if(err.message.includes('user validation failed')){
   Object.values(err.errors).forEach(({properties}) => {
    error[properties.path] = properties.message;
    
   })
  }
  return error;
//   console.log(error);
}

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, keysecret, {
    expiresIn: maxAge
  });
};

module.exports.signup_post = async (req,res) => {
    const {name, email, password} = req.body;


    try{
        // Check if the email is already registered
        const preuser = await User.findOne({email:email})
        if(preuser){
            res.status(422).json({error:"This email already exist"})
        }
        else{
        
       const finalUser = new User({
        name, email, password
       })
     //password hashing
     const content = await finalUser.save();
       //token generate
       const token =  createToken(content._id);
       // console.log(token);
      // Cookie generation
       res.cookie("usercookie",token,{
           expires:new Date(Date.now()+9000000),
           httpOnly:true
       });
       
       const result = {
            content,
            token
       }
     res.status(201).json({status:true,result})
        }

    }
    catch(err) {
      const errors =  handleErrors(err);
      res.status(400).json({errors})
       console.log(err);
    }
   
}



module.exports.signin_post = async (req,res) => {

    const {email,password} = req.body;
    if(!email || !password){
        res.status(422).json({error:"fill all the details"})
    }
    try{
        const userValid = await User.findOne({email:email});
        if(userValid){
            const isMatch = await bcrypt.compare(password,userValid.password);

            if(!isMatch){
                res.status(422).json({ error: "incorrect password"})
            }
            else{
                //token generate
                const token =  createToken(userValid._id);
                // console.log(token);
               // Cookie generation
                res.cookie("usercookie",token,{
                    expires:new Date(Date.now()+9000000),
                    httpOnly:true
                });
                
                const result = {
                    userValid,
                     token
                }
                res.status(201).json({status:true,result});
            }
        }
    } catch(error){
        res.status(401).json(error);
        console.log(error);
  }
}

module.exports.me_get = async (req,res) => {
    
   // console.log(req.cookies);
   const token = req.cookies;
    
        if(token){
          res.status(201).json({status: true,token});
        }
    else{
        res.status(401).json({ error: "unauthorized"});
  }
}