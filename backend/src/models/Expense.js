const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  name_en: {
    type: String,
    required: [true, 'Please provide English name'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
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

// Index for search
expenseSchema.index({ name_en: 'text' });

// Update timestamp on save
expenseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);
