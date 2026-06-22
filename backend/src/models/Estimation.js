const mongoose = require('mongoose');

const EstimationSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    match: [/^[0-9]{10}$/, 'Invalid mobile number']
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },
  guestCount: {
    type: Number,
    required: [true, 'Guest count is required'],
    min: 1
  },
  selectedMenus: [
    {
      menuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu'
      },
      menuName_en: String,
      menuName_ta: String,
      quantity: Number,
      _id: false
    }
  ],
  ingredients: [
    {
      ingredientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient'
      },
      ingredientName_en: String,
      ingredientName_ta: String,
      unit: String,
      requiredQty: Number,
      currentRate: Number,
      amount: Number,
      _id: false
    }
  ],
  rawMaterialCost: {
    type: Number,
    default: 0
  },
  additionalCost: {
    labourCost: { type: Number, default: 0 },
    gasCost: { type: Number, default: 0 },
    transportCost: { type: Number, default: 0 },
    miscellaneousCost: { type: Number, default: 0 }
  },
  profitMargin: {
    type: Number,
    default: 0
  },
  profitAmount: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Approved', 'Completed'],
    default: 'Draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster searches
EstimationSchema.index({ customerName: 'text' });
EstimationSchema.index({ eventDate: 1 });
EstimationSchema.index({ createdBy: 1 });
EstimationSchema.index({ status: 1 });

module.exports = mongoose.model('Estimation', EstimationSchema);
