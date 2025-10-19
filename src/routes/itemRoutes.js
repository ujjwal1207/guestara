const express = require('express')
const router = express.Router()
const {
  createItem,
  getAllItems,
  getItemsByCategory,
  getItemsBySubCategory,
  getItemById,
  searchItemsByName,
  updateItem
} = require('../controllers/itemController')

/**
 * Item Routes
 * Base path: /api/items
 */

// @route   POST /api/items
// @desc    Create a new item
// @access  Public
router.post('/', createItem)

// @route   GET /api/items
// @desc    Get all items
// @access  Public
router.get('/', getAllItems)

// @route   GET /api/items/search?name=itemName
// @desc    Search items by name
// @access  Public
router.get('/search', searchItemsByName)

// @route   GET /api/items/category/:categoryId
// @desc    Get all items under a category
// @access  Public
router.get('/category/:categoryId', getItemsByCategory)

// @route   GET /api/items/subcategory/:subCategoryId
// @desc    Get all items under a subcategory
// @access  Public
router.get('/subcategory/:subCategoryId', getItemsBySubCategory)

// @route   GET /api/items/:id
// @desc    Get item by ID
// @access  Public
router.get('/:id', getItemById)

// @route   PUT /api/items/:id
// @desc    Update item by ID
// @access  Public
router.put('/:id', updateItem)

module.exports = router
