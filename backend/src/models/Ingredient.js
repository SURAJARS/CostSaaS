const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  name_en: {
    type: String,
    required: [true, 'English name is required'],
    unique: true,
    trim: true
  },
  name_ta: {
    type: String,
    required: [true, 'Tamil name is required'],
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'gm', 'liter', 'ml', 'pcs', 'dozen', 'box']
  },
  currentRate: {
    type: Number,
    required: [true, 'Current rate is required'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['dal', 'spices', 'oil', 'vegetables', 'grains', 'dairy', 'condiments', 'others']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  description: String,
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
IngredientSchema.index({ name_en: 'text', name_ta: 'text' });
IngredientSchema.index({ category: 1 });
IngredientSchema.index({ status: 1 });

module.exports = mongoose.model('Ingredient', IngredientSchema);
