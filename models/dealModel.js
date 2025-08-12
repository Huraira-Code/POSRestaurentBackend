const mongoose = require("mongoose");

const dealItemSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    selectedOptions: [{
        name: String,
        price: Number
    }]
}, { _id: false });

const dealSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
        // Removed global unique constraint - will use compound index with adminId
    },
    description: {
        type: String,
        trim: true
    },
    items: [dealItemSchema],
    dealPrice: {
        type: Number,
        required: true,
        min: 0
    },
    originalPrice: {
        type: Number,
        default: 0,
        min: 0
    },
    savings: {
        type: Number,
        default: 0,
        min: 0
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true // SuperAdmin who created this deal
    }
}, { timestamps: true });

// Calculate original price, savings, and tax information before saving
dealSchema.pre('save', async function(next) {
    if (this.isModified('items') || this.isNew) {
        try {
            const Item = mongoose.model('Item');
            let originalPrice = 0;
            
            for (const dealItem of this.items) {
                const item = await Item.findById(dealItem.itemId);
                if (item) {
                    // Base item price
                    let itemTotalPrice = item.price * dealItem.quantity;
                    
                    // Add selected options price
                    if (dealItem.selectedOptions && dealItem.selectedOptions.length > 0) {
                        const optionsPrice = dealItem.selectedOptions.reduce((optTotal, option) => {
                            return optTotal + (option.price || 0);
                        }, 0);
                        itemTotalPrice += optionsPrice * dealItem.quantity;
                    }
                    
                    originalPrice += itemTotalPrice;
                }
            }
            
            this.originalPrice = originalPrice;
            this.savings = Math.max(0, originalPrice - this.dealPrice);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Method to calculate tax for a deal based on payment method
dealSchema.methods.calculateTax = async function(paymentMethod = 'CASH') {
    const Item = mongoose.model('Item');
    let totalTax = 0;
    
    for (const dealItem of this.items) {
        const item = await Item.findById(dealItem.itemId);
        if (item && item.tax) {
            const taxRate = paymentMethod === 'CARD' ? 
                parseFloat(item.tax.card || 0) : 
                parseFloat(item.tax.cash || 0);
            
            // Calculate tax on the proportional price of each item in the deal
            const itemProportion = (item.price * dealItem.quantity) / this.originalPrice;
            const itemDealPrice = this.dealPrice * itemProportion;
            const itemTax = (itemDealPrice * taxRate) / 100;
            
            totalTax += itemTax;
        }
    }
    
    return totalTax;
};

// Method to get deal details with populated items
dealSchema.methods.getDetailsWithItems = async function() {
    await this.populate({
        path: 'items.itemId',
        select: 'name price pictureURL categoryId tax'
    });
    return this;
};

// Create a compound unique index on adminId and name with case-insensitive collation
// This ensures deal names are unique per admin, not globally
dealSchema.index({ adminId: 1, name: 1 }, { 
    unique: true, 
    collation: { locale: 'en', strength: 2 } // Case-insensitive
});

module.exports = mongoose.model("Deal", dealSchema);
