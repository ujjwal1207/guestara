const express = require('express')
const router = express.Router()
const {
  createSubCategory,
  getAllSubCategories,
  getSubCategoriesByCategory,
  getSubCategoryById,
  getSubCategoryByName,
  updateSubCategory
} = require('../controllers/subCategoryController')

/**
 * SubCategory Routes
 * Base path: /api/subcategories
 */

// @route   POST /api/subcategories/:categoryId
// @desc    Create a new subcategory under a category
// @access  Public
router.post('/:categoryId', createSubCategory)

// @route   GET /api/subcategories
// @desc    Get all subcategories
// @access  Public
router.get('/', getAllSubCategories)

// @route   GET /api/subcategories/search?name=subcategoryName
// @desc    Get subcategory by name
// @access  Public
router.get('/search', getSubCategoryByName)

// @route   GET /api/subcategories/category/:categoryId
// @desc    Get all subcategories under a category
// @access  Public
router.get('/category/:categoryId', getSubCategoriesByCategory)

// @route   GET /api/subcategories/:id
// @desc    Get subcategory by ID
// @access  Public
router.get('/:id', getSubCategoryById)

// @route   PUT /api/subcategories/:id
// @desc    Update subcategory by ID
// @access  Public
router.put('/:id', updateSubCategory)

module.exports = router
