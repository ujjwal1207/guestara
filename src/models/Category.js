const mongoose = require('mongoose')

/**
 * Category Schema
 * Represents a main category in the menu (e.g., Appetizers, Main Course, Desserts)
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true
    },
    image: {
      type: String,
      required: [true, 'Category image URL is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Category description is required'],
      trim: true
    },
    taxApplicability: {
      type: Boolean,
      required: [true, 'Tax applicability is required'],
      default: false
    },
    tax: {
      type: Number,
      required: function () {
        return this.taxApplicability
      },
      min: [0, 'Tax cannot be negative'],
      max: [100, 'Tax cannot exceed 100%']
    },
    taxType: {
      type: String,
      required: function () {
        return this.taxApplicability
      },
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Category', categorySchema)
