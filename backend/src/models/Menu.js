const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['breakfast', 'lunch', 'dinner', 'snacks', 'sweets']
  },
  description_en: String,
  description_ta: String,
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
MenuSchema.index({ name_en: 'text', name_ta: 'text' });
MenuSchema.index({ category: 1 });
MenuSchema.index({ status: 1 });

module.exports = mongoose.model('Menu', MenuSchema);
