const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  menuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: [true, 'Menu ID is required']
  },
  menuName_en: {
    type: String,
    required: true
  },
  menuName_ta: {
    type: String,
    required: true
  },
  baseMembers: {
    type: Number,
    required: [true, 'Base members is required'],
    min: 1
  },
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
RecipeSchema.index({ menuId: 1 });
RecipeSchema.index({ status: 1 });

module.exports = mongoose.model('Recipe', RecipeSchema);
