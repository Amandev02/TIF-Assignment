const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const keysecret = process.env.SECRET_KEY;


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Please enter name'],
        trim: true
    },
    email: {
        type: String,
        required: [true,'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required:  [true,'Please enter a password'],
        minlength: [6, 'Minimum password length is 6']
    },
    community:[
        { type: mongoose.Types.ObjectId,
             ref: 'Community',
              required: true
         }
        ],
    role: { type: mongoose.Schema.Types.ObjectId,
            ref: 'Role'
    },
    created_at: { 
        type: Date,
        default: Date.now 
       },
     updated_at: { 
       type: Date, 
       default: Date.now 
     },
});

// hash password

userSchema.pre("save",async function (next){
    this.updated_at = new Date();

    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,12);
    }

    next();
})


//creating new user
const User = new mongoose.model('User', userSchema);

module.exports = User;