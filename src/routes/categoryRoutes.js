const express = require('express')
const router = express.Router()
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryByName,
  updateCategory
} = require('../controllers/categoryController')

/**
 * Category Routes
 * Base path: /api/categories
 */

// @route   POST /api/categories
// @desc    Create a new category
// @access  Public
router.post('/', createCategory)

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', getAllCategories)

// @route   GET /api/categories/search?name=categoryName
// @desc    Get category by name
// @access  Public
router.get('/search', getCategoryByName)

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', getCategoryById)

// @route   PUT /api/categories/:id
// @desc    Update category by ID
// @access  Public
router.put('/:id', updateCategory)

module.exports = router
