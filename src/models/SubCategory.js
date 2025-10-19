const mongoose = require('mongoose')

/**
 * SubCategory Schema
 * Represents a subcategory under a main category (e.g., Vegetarian Appetizers under Appetizers)
 */
const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subcategory name is required'],
      trim: true
    },
    image: {
      type: String,
      required: [true, 'Subcategory image URL is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Subcategory description is required'],
      trim: true
    },
    taxApplicability: {
      type: Boolean,
      required: true,
      default: function () {
        // Will be set from parent category during creation
        return false
      }
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
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category ID is required']
    }
  },
  {
    timestamps: true
  }
)

// Compound index to ensure unique subcategory names within a category
subCategorySchema.index({ name: 1, categoryId: 1 }, { unique: true })

module.exports = mongoose.model('SubCategory', subCategorySchema)
