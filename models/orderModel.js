const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      menuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        required: false
      },
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  deals: [
    {
      dealId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deal',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      dealPrice: {
        type: Number,
        required: true
      },
      originalPrice: {
        type: Number,
        required: true
      },
      savings: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1
      },
      dealTax: {
        type: Number,
        default: 0
      },
      items: [
        {
          itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true
          },
          name: {
            type: String,
            required: true
          },
          quantity: {
            type: Number,
            required: true
          },
          selectedOptions: [{
            name: String,
            price: Number
          }]
        }
      ]
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  totalTax: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number
  },
  originalAmount: {
    type: Number
  },
  finalTotal: {
    type: Number
  },
  totalSavings: {
    type: Number
  },
  pricingDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  voucherCode: {
    type: String
  },
  voucherDiscount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'UNPAID'],
    default: 'UNPAID'
  },
  cardDetails: {
    username: {
      type: String,

    },
    cardNumber: {
      type: String,
    },
  },
  logo: {
    type: String,
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'CARD', 'ONLINE'],
  },
  paymentType: {
    type: String,
    enum: ['CASH', 'CARD', 'ONLINE', 'COD', 'cod', 'online', 'on_arrival'],   // COD = Cash on Delivery | on_arrival = Pay on Arrival
    default: 'CASH' 
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'card', 'online'],
    default: 'cash'
  },
  customerInfo: {
    name: {
      type: String,
      required: false
    },
    phone: {
      type: String,
      required: false
    },
    address: {
      type: String,
      required: false
    }
  },
  orderType: {
    type: String,
    enum: ['DINE', 'DELIVERY', "PICKUP"],
    required: true
  },
  orderStatus: {
    type: String,
    enum: ['IN_PROGRESS', 'COMPLETED'],
    required: true
  },
  printedAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('Order', orderSchema);
