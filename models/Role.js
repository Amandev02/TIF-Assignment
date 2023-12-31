const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { 
      type: String, 
      required: true 
    },
    created_at: { 
       type: Date,
       default: Date.now 
      },
    updated_at: { 
      type: Date, 
      default: Date.now 
    },
  // scope: {
  //   type: String,
  //   required: true
  // }

});

roleSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Role', roleSchema);
