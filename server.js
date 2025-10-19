require('dotenv').config()
const app = require('./src/app')
const connectDB = require('./src/config/db')

const PORT = process.env.PORT || 3000

/**
 * Start server
 * 1. Connect to database
 * 2. Start Express server
 */
const startServer = async () => {
  try {
    // Connect to database
    await connectDB()

    // Start server
    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      )
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()
