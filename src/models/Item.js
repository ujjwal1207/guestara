const mongoose = require('mongoose')

/**
 * Item Schema
 * Represents individual menu items that belong to either a category or subcategory
 */
const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true
    },
    image: {
      type: String,
      required: [true, 'Item image URL is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Item description is required'],
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
    },
    baseAmount: {
      type: Number,
      required: [true, 'Base amount is required'],
      min: [0, 'Base amount cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      validate: {
        validator: function (discount) {
          // Only validate if both discount and baseAmount are available
          if (this.baseAmount !== undefined && discount !== undefined) {
            return discount <= this.baseAmount
          }
          return true // Skip validation if baseAmount is not available
        },
        message: 'Discount cannot be greater than base amount'
      }
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative']
    },
    // Item can belong to either a category directly or a subcategory
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: function () {
        return !this.subCategoryId
      }
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: function () {
        return !this.categoryId
      }
    }
  },
  {
    timestamps: true
  }
)

// Pre-save middleware to calculate total amount
itemSchema.pre('save', function (next) {
  this.totalAmount = this.baseAmount - this.discount
  next()
})

// Pre-update middleware to recalculate total amount
itemSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate()
  if (update.baseAmount !== undefined || update.discount !== undefined) {
    // Get the current document to access existing values
    const currentDoc = await this.model.findOne(this.getQuery())
    if (currentDoc) {
      const baseAmount =
        update.baseAmount !== undefined
          ? update.baseAmount
          : currentDoc.baseAmount
      const discount =
        update.discount !== undefined ? update.discount : currentDoc.discount

      // Validate discount doesn't exceed baseAmount
      if (discount > baseAmount) {
        const error = new Error('Discount cannot be greater than base amount')
        error.name = 'ValidationError'
        return next(error)
      }

      update.totalAmount = baseAmount - discount
    }
  }
  next()
})

// Compound index for uniqueness within category/subcategory
itemSchema.index(
  { name: 1, categoryId: 1 },
  {
    unique: true,
    partialFilterExpression: { categoryId: { $exists: true } }
  }
)

itemSchema.index(
  { name: 1, subCategoryId: 1 },
  {
    unique: true,
    partialFilterExpression: { subCategoryId: { $exists: true } }
  }
)

module.exports = mongoose.model('Item', itemSchema)
