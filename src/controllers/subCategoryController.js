const SubCategory = require('../models/SubCategory')
const Category = require('../models/Category')
const { createError } = require('../utils/helpers')

/**
 * Create a new subcategory under a category
 * POST /api/subcategories/:categoryId
 */
const createSubCategory = async (req, res) => {
  try {
    const { categoryId } = req.params
    const { name, image, description, taxApplicability, tax, taxType } =
      req.body

    // Validate required fields
    if (!name || !image || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name, image, and description are required'
      })
    }

    // Check if parent category exists
    const parentCategory = await Category.findById(categoryId)
    if (!parentCategory) {
      return res.status(404).json({
        success: false,
        message: 'Parent category not found'
      })
    }

    // Prepare subcategory data with inheritance from parent
    const subCategoryData = {
      name,
      image,
      description,
      categoryId,
      // Inherit tax settings from parent category if not explicitly provided
      taxApplicability:
        taxApplicability !== undefined
          ? taxApplicability
          : parentCategory.taxApplicability,
      tax: tax !== undefined ? tax : parentCategory.tax,
      taxType: taxType !== undefined ? taxType : parentCategory.taxType
    }

    // Validate tax fields if tax is applicable
    if (
      subCategoryData.taxApplicability &&
      ((!subCategoryData.tax && subCategoryData.tax !== 0) ||
        !subCategoryData.taxType)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Tax amount and tax type are required when tax is applicable'
      })
    }

    const subCategory = new SubCategory(subCategoryData)
    await subCategory.save()

    // Populate the category information
    await subCategory.populate('categoryId', 'name')

    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      data: subCategory
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory with this name already exists in this category'
      })
    }

    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Get all subcategories
 * GET /api/subcategories
 */
const getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find()
      .populate('categoryId', 'name description')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: subCategories.length,
      data: subCategories
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Get all subcategories under a specific category
 * GET /api/subcategories/category/:categoryId
 */
const getSubCategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params

    // Check if category exists
    const category = await Category.findById(categoryId)
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    const subCategories = await SubCategory.find({ categoryId })
      .populate('categoryId', 'name description')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: subCategories.length,
      data: subCategories,
      category: category.name
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
 * Get subcategory by ID
 * GET /api/subcategories/:id
 */
const getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id).populate(
      'categoryId',
      'name description taxApplicability tax taxType'
    )

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      })
    }

    res.status(200).json({
      success: true,
      data: subCategory
    })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      })
    }

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Get subcategory by name
 * GET /api/subcategories/search?name=subcategoryName
 */
const getSubCategoryByName = async (req, res) => {
  try {
    const { name } = req.query

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory name is required'
      })
    }

    const subCategory = await SubCategory.findOne({
      name: { $regex: name, $options: 'i' }
    }).populate('categoryId', 'name description')

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      })
    }

    res.status(200).json({
      success: true,
      data: subCategory
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Update subcategory
 * PUT /api/subcategories/:id
 */
const updateSubCategory = async (req, res) => {
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

    const subCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name description')

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Subcategory updated successfully',
      data: subCategory
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory with this name already exists in this category'
      })
    }

    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      })
    }

    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = {
  createSubCategory,
  getAllSubCategories,
  getSubCategoriesByCategory,
  getSubCategoryById,
  getSubCategoryByName,
  updateSubCategory
}
