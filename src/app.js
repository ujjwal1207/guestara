const express = require('express')
const cors = require('cors')

// Import routes
const categoryRoutes = require('./routes/categoryRoutes')
const subCategoryRoutes = require('./routes/subCategoryRoutes')
const itemRoutes = require('./routes/itemRoutes')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Menu Management API is running',
    timestamp: new Date().toISOString()
  })
})

// API Routes
app.use('/api/categories', categoryRoutes)
app.use('/api/subcategories', subCategoryRoutes)
app.use('/api/items', itemRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Error handler
app.use((error, req, res, next) => {
  let statusCode = error.statusCode || 500
  let message = error.message || 'Internal Server Error'

  if (error.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation Error'
  }

  if (error.name === 'CastError') {
    statusCode = 404
    message = 'Resource not found'
  }

  if (error.code === 11000) {
    statusCode = 400
    message = 'Duplicate entry'
  }

  res.status(statusCode).json({
    success: false,
    message
  })
})

module.exports = app
