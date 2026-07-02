const mongoose = require('mongoose');

const ComboSchema = new mongoose.Schema({
  name_en: {
    type: String,
    required: [true, 'English name is required'],
    trim: true
  },
  name_ta: {
    type: String,
    required: [true, 'Tamil name is required'],
    trim: true
  },
  description_en: {
    type: String,
    default: ''
  },
  description_ta: {
    type: String,
    default: ''
  },
  baseMembers: {
    type: Number,
    required: [true, 'Base members is required'],
    min: 1
  },
  selectedMenus: [
    {
      menuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        required: true
      },
      menuName_en: String,
      menuName_ta: String,
      _id: false
    }
  ],
  ingredients: [
    {
      ingredientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient',
        required: true
      },
      ingredientName_en: String,
      ingredientName_ta: String,
      quantity: {
        type: Number,
        required: true,
        min: 0
      },
      unit: {
        type: String,
        required: true
      },
      _id: false
    }
  ],
  expenses: [
    {
      expenseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense',
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      _id: false
    }
  ],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
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
ComboSchema.index({ name_en: 'text', name_ta: 'text' });
ComboSchema.index({ status: 1 });

module.exports = mongoose.model('Combo', ComboSchema);
