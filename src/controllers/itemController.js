const Item = require('../models/Item')
const Category = require('../models/Category')
const SubCategory = require('../models/SubCategory')
const { calculateTotal, createError } = require('../utils/helpers')

/**
 * Create a new item
 * POST /api/items
 */
const createItem = async (req, res) => {
  try {
    const {
      name,
      image,
      description,
      taxApplicability,
      tax,
      taxType,
      baseAmount,
      discount = 0,
      categoryId,
      subCategoryId
    } = req.body

    // Validate required fields
    if (
      !name ||
      !image ||
      !description ||
      taxApplicability === undefined ||
      baseAmount === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Name, image, description, tax applicability, and base amount are required'
      })
    }

    // Validate that either categoryId or subCategoryId is provided (but not both)
    if (!categoryId && !subCategoryId) {
      return res.status(400).json({
        success: false,
        message: 'Either category ID or subcategory ID must be provided'
      })
    }

    if (categoryId && subCategoryId) {
      return res.status(400).json({
        success: false,
        message:
          'Item cannot belong to both category and subcategory simultaneously'
      })
    }

    // Validate tax fields if tax is applicable
    if (taxApplicability && ((!tax && tax !== 0) || !taxType)) {
      return res.status(400).json({
        success: false,
        message: 'Tax amount and tax type are required when tax is applicable'
      })
    }

    // Verify that the parent category or subcategory exists
    if (categoryId) {
      const category = await Category.findById(categoryId)
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        })
      }
    }

    if (subCategoryId) {
      const subCategory = await SubCategory.findById(subCategoryId)
      if (!subCategory) {
        return res.status(404).json({
          success: false,
          message: 'Subcategory not found'
        })
      }
    }

    // Calculate total amount
    const totalAmount = calculateTotal(baseAmount, discount)

    const itemData = {
      name,
      image,
      description,
      taxApplicability,
      baseAmount,
      discount,
      totalAmount
    }

    // Add tax fields only if applicable
    if (taxApplicability) {
      itemData.tax = tax
      itemData.taxType = taxType
    }

    // Add category or subcategory reference
    if (categoryId) {
      itemData.categoryId = categoryId
    } else {
      itemData.subCategoryId = subCategoryId
    }

    const item = new Item(itemData)
    await item.save()

    // Populate references
    await item.populate([
      { path: 'categoryId', select: 'name description' },
      { path: 'subCategoryId', select: 'name description' }
    ])

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          'Item with this name already exists in this category/subcategory'
      })
    }

    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Get all items
 * GET /api/items
 */
const getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate('categoryId', 'name description')
      .populate('subCategoryId', 'name description')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Get all items under a category
 * GET /api/items/category/:categoryId
 */
const getItemsByCategory = async (req, res) => {
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

    const items = await Item.find({ categoryId })
      .populate('categoryId', 'name description')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
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
 * Get all items under a subcategory
 * GET /api/items/subcategory/:subCategoryId
 */
const getItemsBySubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params

    // Check if subcategory exists
    const subCategory = await SubCategory.findById(subCategoryId)
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      })
    }

    const items = await Item.find({ subCategoryId })
      .populate('subCategoryId', 'name description')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
      subcategory: subCategory.name
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
 * Get item by ID
 * GET /api/items/:id
 */
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('categoryId', 'name description taxApplicability tax taxType')
      .populate(
        'subCategoryId',
        'name description taxApplicability tax taxType'
      )

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      })
    }

    res.status(200).json({
      success: true,
      data: item
    })
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      })
    }

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Search items by name
 * GET /api/items/search?name=itemName
 */
const searchItemsByName = async (req, res) => {
  try {
    const { name } = req.query

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Item name is required for search'
      })
    }

    const items = await Item.find({
      name: { $regex: name, $options: 'i' }
    })
      .populate('categoryId', 'name description')
      .populate('subCategoryId', 'name description')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
      searchTerm: name
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Update item
 * PUT /api/items/:id
 */
const updateItem = async (req, res) => {
  try {
    const {
      name,
      image,
      description,
      taxApplicability,
      tax,
      taxType,
      baseAmount,
      discount,
      categoryId,
      subCategoryId
    } = req.body

    // Build update object
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (image !== undefined) updateData.image = image
    if (description !== undefined) updateData.description = description
    if (baseAmount !== undefined) updateData.baseAmount = baseAmount
    if (discount !== undefined) updateData.discount = discount

    // Handle category/subcategory updates
    if (categoryId !== undefined && subCategoryId !== undefined) {
      return res.status(400).json({
        success: false,
        message:
          'Item cannot belong to both category and subcategory simultaneously'
      })
    }

    if (categoryId !== undefined) {
      if (categoryId) {
        const category = await Category.findById(categoryId)
        if (!category) {
          return res.status(404).json({
            success: false,
            message: 'Category not found'
          })
        }
      }
      updateData.categoryId = categoryId
      updateData.$unset = { subCategoryId: '' }
    }

    if (subCategoryId !== undefined) {
      if (subCategoryId) {
        const subCategory = await SubCategory.findById(subCategoryId)
        if (!subCategory) {
          return res.status(404).json({
            success: false,
            message: 'Subcategory not found'
          })
        }
      }
      updateData.subCategoryId = subCategoryId
      updateData.$unset = { categoryId: '' }
    }

    // Handle tax settings
    if (taxApplicability !== undefined) {
      updateData.taxApplicability = taxApplicability

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
        updateData.$unset = { ...updateData.$unset, tax: '', taxType: '' }
      }
    } else {
      if (tax !== undefined) updateData.tax = tax
      if (taxType !== undefined) updateData.taxType = taxType
    }

    // Calculate new total if baseAmount or discount changed
    if (baseAmount !== undefined || discount !== undefined) {
      const currentItem = await Item.findById(req.params.id)
      if (!currentItem) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        })
      }

      const newBaseAmount =
        baseAmount !== undefined ? baseAmount : currentItem.baseAmount
      const newDiscount =
        discount !== undefined ? discount : currentItem.discount
      updateData.totalAmount = calculateTotal(newBaseAmount, newDiscount)
    }

    const item = await Item.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    })
      .populate('categoryId', 'name description')
      .populate('subCategoryId', 'name description')

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: item
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          'Item with this name already exists in this category/subcategory'
      })
    }

    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      })
    }

    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = {
  createItem,
  getAllItems,
  getItemsByCategory,
  getItemsBySubCategory,
  getItemById,
  searchItemsByName,
  updateItem
}
