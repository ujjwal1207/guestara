const Category = require('../models/Category')
const { createError } = require('../utils/helpers')

/**
 * Create a new category
 * POST /api/categories
 */
const createCategory = async (req, res) => {
  try {
    const { name, image, description, taxApplicability, tax, taxType } =
      req.body

    // Validate required fields
    if (!name || !image || !description || taxApplicability === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, image, description, and tax applicability are required'
      })
    }

    // Validate tax fields if tax is applicable
    if (taxApplicability && ((!tax && tax !== 0) || !taxType)) {
      return res.status(400).json({
        success: false,
        message: 'Tax amount and tax type are required when tax is applicable'
      })
    }

    const categoryData = {
      name,
      image,
      description,
      taxApplicability
    }

    // Add tax fields only if applicable
    if (taxApplicability) {
      categoryData.tax = tax
      categoryData.taxType = taxType
    }

    const category = new Category(categoryData)
    await category.save()

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      })
    }

    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Get all categories
 * GET /api/categories
 */
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Get category by ID
 * GET /api/categories/:id
 */
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    res.status(200).json({
      success: true,
      data: category
    })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Get category by name
 * GET /api/categories/search?name=categoryName
 */
const getCategoryByName = async (req, res) => {
  try {
    const { name } = req.query

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      })
    }

    const category = await Category.findOne({
      name: { $regex: name, $options: 'i' }
    })

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    res.status(200).json({
      success: true,
      data: category
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Update category
 * PUT /api/categories/:id
 */
const updateCategory = async (req, res) => {
  try {
    const { name, image, description, taxApplicability, tax, taxType } =
      req.body

    // Build update object
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (image !== undefined) updateData.image = image
    if (description !== undefined) updateData.description = description
    if (taxApplicability !== undefined) {
      updateData.taxApplicability = taxApplicability

      // If tax is now applicable, require tax fields
      if (taxApplicability) {
        if ((!tax && tax !== 0) || !taxType) {
          return res.status(400).json({
            success: false,
            message:
              'Tax amount and tax type are required when tax is applicable'
          })
        }
        updateData.tax = tax
        updateData.taxType = taxType
      } else {
        // Remove tax fields if not applicable
        updateData.$unset = { tax: '', taxType: '' }
      }
    } else {
      // If taxApplicability is not being changed, still allow tax updates
      if (tax !== undefined) updateData.tax = tax
      if (taxType !== undefined) updateData.taxType = taxType
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      })
    }

    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryByName,
  updateCategory
}
