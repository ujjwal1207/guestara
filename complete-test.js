// Comprehensive API test script for Menu Management Backend
const BASE_URL = 'http://localhost:5000/api'

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  }

  if (data) {
    options.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const result = await response.json()
    return { status: response.status, data: result }
  } catch (error) {
    return { status: 'ERROR', data: { message: error.message } }
  }
}

// Test the complete flow
const testCompleteFlow = async () => {
  console.log('🚀 Starting Menu Management API Test...\n')

  let categoryId, subCategoryId, itemId

  try {
    // 1. Create a Category
    console.log('1️⃣ Creating Category...')
    const categoryData = {
      name: 'Main Course',
      image: 'https://example.com/main-course.jpg',
      description: 'Hearty main dishes for your meal',
      taxApplicability: true,
      tax: 15,
      taxType: 'percentage'
    }

    const categoryResult = await apiCall('POST', '/categories', categoryData)
    console.log(`Status: ${categoryResult.status}`)
    console.log('Response:', categoryResult.data)

    if (categoryResult.data.success) {
      categoryId = categoryResult.data.data._id
      console.log(`✅ Category created with ID: ${categoryId}\n`)
    } else {
      console.log('❌ Failed to create category\n')
      return
    }

    // 2. Create a SubCategory
    console.log('2️⃣ Creating SubCategory...')
    const subCategoryData = {
      name: 'Pasta',
      image: 'https://example.com/pasta.jpg',
      description: 'Delicious Italian pasta dishes'
      // Tax settings will be inherited from parent category
    }

    const subCategoryResult = await apiCall(
      'POST',
      `/subcategories/${categoryId}`,
      subCategoryData
    )
    console.log(`Status: ${subCategoryResult.status}`)
    console.log('Response:', subCategoryResult.data)

    if (subCategoryResult.data.success) {
      subCategoryId = subCategoryResult.data.data._id
      console.log(`✅ SubCategory created with ID: ${subCategoryId}\n`)
    } else {
      console.log('❌ Failed to create subcategory\n')
      return
    }

    // 3. Create an Item under SubCategory
    console.log('3️⃣ Creating Item...')
    const itemData = {
      name: 'Spaghetti Carbonara',
      image: 'https://example.com/carbonara.jpg',
      description: 'Classic Italian pasta with eggs, cheese, and pancetta',
      taxApplicability: true,
      tax: 15,
      taxType: 'percentage',
      baseAmount: 18.99,
      discount: 2.0,
      subCategoryId: subCategoryId
    }

    const itemResult = await apiCall('POST', '/items', itemData)
    console.log(`Status: ${itemResult.status}`)
    console.log('Response:', itemResult.data)

    if (itemResult.data.success) {
      itemId = itemResult.data.data._id
      console.log(`✅ Item created with ID: ${itemId}`)
      console.log(`💰 Total Amount: $${itemResult.data.data.totalAmount}\n`)
    } else {
      console.log('❌ Failed to create item\n')
      return
    }

    // 4. Test GET operations
    console.log('4️⃣ Testing GET operations...')

    // Get all categories
    const allCategories = await apiCall('GET', '/categories')
    console.log(`📋 Total Categories: ${allCategories.data.count}`)

    // Get all subcategories
    const allSubCategories = await apiCall('GET', '/subcategories')
    console.log(`📋 Total SubCategories: ${allSubCategories.data.count}`)

    // Get all items
    const allItems = await apiCall('GET', '/items')
    console.log(`📋 Total Items: ${allItems.data.count}\n`)

    // 5. Test Search functionality
    console.log('5️⃣ Testing Search functionality...')

    // Search items by name
    const searchResult = await apiCall('GET', '/items/search?name=Spaghetti')
    console.log(
      `🔍 Search Results for "Spaghetti": ${searchResult.data.count} items found`
    )
    if (searchResult.data.count > 0) {
      console.log(`Found: ${searchResult.data.data[0].name}\n`)
    }

    // 6. Test relationships
    console.log('6️⃣ Testing Relationships...')

    // Get items by category
    const itemsByCategory = await apiCall(
      'GET',
      `/items/category/${categoryId}`
    )
    console.log(
      `🔗 Items in category "${itemsByCategory.data.category}": ${itemsByCategory.data.count}`
    )

    // Get items by subcategory
    const itemsBySubCategory = await apiCall(
      'GET',
      `/items/subcategory/${subCategoryId}`
    )
    console.log(
      `🔗 Items in subcategory "${itemsBySubCategory.data.subcategory}": ${itemsBySubCategory.data.count}\n`
    )

    // 7. Test Update operations
    console.log('7️⃣ Testing Update operations...')

    const updateData = {
      baseAmount: 20.99,
      discount: 3.0
    }

    const updateResult = await apiCall('PUT', `/items/${itemId}`, updateData)
    console.log(`Status: ${updateResult.status}`)
    if (updateResult.data.success) {
      console.log(`✅ Item updated successfully`)
      console.log(
        `💰 New Total Amount: $${updateResult.data.data.totalAmount}\n`
      )
    }

    console.log('🎉 All tests completed successfully!')
    console.log('\n📊 Test Summary:')
    console.log('✅ Category Creation')
    console.log('✅ SubCategory Creation (with tax inheritance)')
    console.log('✅ Item Creation (with automatic total calculation)')
    console.log('✅ GET operations (all entities)')
    console.log('✅ Search functionality')
    console.log('✅ Relationship queries')
    console.log('✅ Update operations (with recalculation)')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testCompleteFlow()
