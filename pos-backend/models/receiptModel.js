const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  menuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
  },
  menuName: {
    type: String,
    required: true,
  },
  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  deals: [
    {
      dealId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Deal",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      dealPrice: {
        type: Number,
        required: true,
      },
      originalPrice: {
        type: Number,
        required: true,
      },
      savings: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      items: [
        {
          name: String,
          quantity: Number,
        },
      ],
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  totalTax: {
    type: Number,
    required: true,
  },
  itemDiscount: {
    type: Number,
    required: true,
  },
  voucherDiscount: {
    type: Number,
    default: 0,
  },
  voucherCode: {
    type: String,
  },
  originalAmount: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
  },
  finalTotal: {
    type: Number,
  },
  totalSavings: {
    type: Number,
  },
  pricingDetails: {
    type: mongoose.Schema.Types.Mixed,
  },
  paymentMethod: {
    type: String,
    enum: ["CASH", "CARD", "ONLINE", "CASH ON DELIVERY", "CASH ON ARRIVAL"],
  },
  customerInfo: {
    name: String,
    phone: String,
    address: String,
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

  paymentMode: {
    type: String,
    enum: ["EasyPaisa", "JazzCash", "Bank", "Other"],
  },
  paymentStatus: {
    type: String,
    enum: ["PAID", "UNPAID"],
    default: "UNPAID",
  },
  orderType: {
    type: String,
    enum: ["DINE", "DELIVERY", "PICKUP", "FOODPANDA", "FREE FOOD", "MARKETING"],
    required: true,
  },
  printedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Receipt", receiptSchema);
