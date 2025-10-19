# Menu Management Backend API

A comprehensive Node.js backend server for restaurant menu management with categories, subcategories, and items. Built with Express.js and MongoDB.

## 🚀 Features

- **Category Management**: Create, read, and update menu categories
- **SubCategory Management**: Organize items under categories with inheritance
- **Item Management**: Complete CRUD operations for menu items
- **Search Functionality**: Search items by name with partial matching
- **Tax Management**: Flexible tax configuration at all levels
- **Automatic Calculations**: Total amount calculation (base - discount)
- **Data Validation**: Comprehensive input validation and error handling
- **RESTful API**: Well-structured REST endpoints

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## ⚡ Quick Start

### 1. Installation

```bash
# Clone or navigate to project directory
cd menu-management-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 2. Environment Configuration

Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=3000

# Database Configuration
MONGO_URI=mongodb+srv://sharmaujjwal2019:Ujjwal123@ujjwaldatabase.zraibfy.mongodb.net/menu-management?retryWrites=true&w=majority&appName=Ujjwaldatabase

# Environment
NODE_ENV=production
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For Windows
net start MongoDB

# For macOS with Homebrew
brew services start mongodb-community

# For Linux
sudo service mongod start
```

### 4. Run the Application

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Health Check
```http
GET /health
```

### API Overview
```http
GET /api
```

## 🏗️ API Endpoints

### Categories

#### Create Category
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Appetizers",
  "image": "https://example.com/appetizers.jpg",
  "description": "Delicious starters to begin your meal",
  "taxApplicability": true,
  "tax": 10,
  "taxType": "percentage"
}
```

#### Get All Categories
```http
GET /api/categories
```

#### Get Category by ID
```http
GET /api/categories/{categoryId}
```

#### Search Category by Name
```http
GET /api/categories/search?name=Appetizers
```

#### Update Category
```http
PUT /api/categories/{categoryId}
Content-Type: application/json

{
  "name": "Updated Appetizers",
  "description": "Updated description"
}
```

### SubCategories

#### Create SubCategory
```http
POST /api/subcategories/{categoryId}
Content-Type: application/json

{
  "name": "Vegetarian Appetizers",
  "image": "https://example.com/veg-appetizers.jpg",
  "description": "Plant-based starters",
  "taxApplicability": true,
  "tax": 12,
  "taxType": "percentage"
}
```

#### Get All SubCategories
```http
GET /api/subcategories
```

#### Get SubCategories by Category
```http
GET /api/subcategories/category/{categoryId}
```

#### Get SubCategory by ID
```http
GET /api/subcategories/{subCategoryId}
```

#### Search SubCategory by Name
```http
GET /api/subcategories/search?name=Vegetarian
```

#### Update SubCategory
```http
PUT /api/subcategories/{subCategoryId}
Content-Type: application/json

{
  "name": "Updated Vegetarian Appetizers",
  "description": "Updated description"
}
```

### Items

#### Create Item
```http
POST /api/items
Content-Type: application/json

{
  "name": "Caesar Salad",
  "image": "https://example.com/caesar-salad.jpg",
  "description": "Fresh romaine with parmesan and croutons",
  "taxApplicability": true,
  "tax": 8,
  "taxType": "percentage",
  "baseAmount": 12.99,
  "discount": 2.00,
  "categoryId": "categoryObjectId"
}
```

#### Create Item under SubCategory
```http
POST /api/items
Content-Type: application/json

{
  "name": "Veggie Spring Rolls",
  "image": "https://example.com/spring-rolls.jpg",
  "description": "Crispy vegetable spring rolls",
  "taxApplicability": false,
  "baseAmount": 8.99,
  "discount": 0,
  "subCategoryId": "subCategoryObjectId"
}
```

#### Get All Items
```http
GET /api/items
```

#### Get Items by Category
```http
GET /api/items/category/{categoryId}
```

#### Get Items by SubCategory
```http
GET /api/items/subcategory/{subCategoryId}
```

#### Get Item by ID
```http
GET /api/items/{itemId}
```

#### Search Items by Name
```http
GET /api/items/search?name=salad
```

#### Update Item
```http
PUT /api/items/{itemId}
Content-Type: application/json

{
  "name": "Updated Caesar Salad",
  "baseAmount": 14.99,
  "discount": 1.00
}
```

## 📊 Data Models

### Category Schema
```javascript
{
  name: String (required, unique),
  image: String (required),
  description: String (required),
  taxApplicability: Boolean (required),
  tax: Number (required if taxApplicability is true),
  taxType: String (required if taxApplicability is true, enum: ['percentage', 'fixed'])
}
```

### SubCategory Schema
```javascript
{
  name: String (required),
  image: String (required),
  description: String (required),
  taxApplicability: Boolean (required, inherits from category),
  tax: Number (inherits from category),
  taxType: String (inherits from category),
  categoryId: ObjectId (required, ref: 'Category')
}
```

### Item Schema
```javascript
{
  name: String (required),
  image: String (required),
  description: String (required),
  taxApplicability: Boolean (required),
  tax: Number (required if taxApplicability is true),
  taxType: String (required if taxApplicability is true),
  baseAmount: Number (required),
  discount: Number (default: 0),
  totalAmount: Number (calculated: baseAmount - discount),
  categoryId: ObjectId (ref: 'Category', required if no subCategoryId),
  subCategoryId: ObjectId (ref: 'SubCategory', required if no categoryId)
}
```

## 🔧 Business Logic

### Tax Inheritance
- SubCategories inherit tax settings from their parent Category by default
- Tax settings can be overridden during subcategory creation
- Items require explicit tax configuration

### Total Amount Calculation
- Automatically calculated as: `totalAmount = baseAmount - discount`
- Validated to ensure discount doesn't exceed base amount
- Recalculated automatically when base amount or discount changes

### Validation Rules
- Category names must be unique
- SubCategory names must be unique within a category
- Item names must be unique within their category/subcategory
- Items must belong to either a category OR subcategory (not both)
- Tax amount and type required when tax is applicable

## 🧪 Testing with Postman

### 1. Import Collection
Create a new Postman collection and add the endpoints listed above.

### 2. Environment Variables
Set up environment variables:
- `baseUrl`: `http://localhost:3000/api`

### 3. Sample Test Flow

1. **Create a Category**
   ```json
   POST {{baseUrl}}/categories
   {
     "name": "Main Course",
     "image": "https://example.com/main-course.jpg",
     "description": "Hearty main dishes",
     "taxApplicability": true,
     "tax": 15,
     "taxType": "percentage"
   }
   ```

2. **Create a SubCategory**
   ```json
   POST {{baseUrl}}/subcategories/{categoryId}
   {
     "name": "Pasta",
     "image": "https://example.com/pasta.jpg",
     "description": "Italian pasta dishes"
   }
   ```

3. **Create an Item**
   ```json
   POST {{baseUrl}}/items
   {
     "name": "Spaghetti Carbonara",
     "image": "https://example.com/carbonara.jpg",
     "description": "Classic Italian pasta with eggs and bacon",
     "taxApplicability": true,
     "tax": 15,
     "taxType": "percentage",
     "baseAmount": 18.99,
     "discount": 2.00,
     "subCategoryId": "{subCategoryId}"
   }
   ```

4. **Search Items**
   ```
   GET {{baseUrl}}/items/search?name=spaghetti
   ```

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `404`: Not Found
- `500`: Internal Server Error

## 📁 Project Structure

```
menu-management-backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── Category.js           # Category schema
│   │   ├── SubCategory.js        # SubCategory schema
│   │   └── Item.js               # Item schema
│   ├── controllers/
│   │   ├── categoryController.js
│   │   ├── subCategoryController.js
│   │   └── itemController.js
│   ├── routes/
│   │   ├── categoryRoutes.js
│   │   ├── subCategoryRoutes.js
│   │   └── itemRoutes.js
│   ├── utils/
│   │   └── helpers.js            # Utility functions
│   └── app.js                    # Express app setup
├── server.js                     # Server entry point
├── package.json
├── .env
└── README.md
```

## 🔒 Security Considerations

- Input validation on all endpoints
- CORS enabled for cross-origin requests
- Error messages don't expose sensitive information
- MongoDB injection protection through Mongoose

## 🛠️ Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

### Dependencies
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management
- **nodemon**: Development auto-restart (dev dependency)

## 📝 Future Enhancements

- [ ] Authentication and authorization
- [ ] Image upload functionality
- [ ] Pagination for large datasets
- [ ] Advanced filtering and sorting
- [ ] Rate limiting
- [ ] API versioning
- [ ] Unit and integration tests
- [ ] Docker containerization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

---

**Created for Node.js Backend Internship Assignment**

For any questions or issues, please contact the development team.