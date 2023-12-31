// src/models/Community.js
const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: { type: String, 
         required: true 
    },
  slug: { type: String,
          required: true, 
          unique: true 
    },
  owner: { type: mongoose.Schema.Types.String,
           ref: 'User',
           required: true 
    },
  members: [{ type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
      }],
      created_at: { 
        type: Date,
        default: Date.now 
       },
     updated_at: { 
       type: Date, 
       default: Date.now 
     },
});

communitySchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Community', communitySchema);
