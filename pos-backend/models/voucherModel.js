
const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
 AdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    required: true
  },
 code: {
    type: String,
    required: true,
    unique: true
  },  
  voucherPrice: {
    type: Number,
    required: true,
  }, 
  applyOnce: {
    type: Boolean,  
  },
  voucherType:{
    type:String,
    enum:["FIXED","PERCENTAGE"],
    default:"FIXED"
  },

  // Voucher applies to selected items only
  itemIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "item",
    }
  ],

  //You can also add "isCapped" features if you want them saved
  isCapped: {
    type: Boolean,
    default: false
  },

  capAmount: {
    type: Number,
    default: null
  }

  
}, {timestamps: true});

module.exports = mongoose.model('Voucher', voucherSchema);
