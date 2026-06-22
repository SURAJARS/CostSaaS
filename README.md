# Catering Cost Estimation and Ingredient Planning Application

A complete production-ready full-stack application for catering businesses to calculate ingredient requirements, ingredient costs, and estimated quotation costs based on menu items and number of guests.

## Technology Stack

### Frontend

- React.js 18.2
- Material UI (MUI) 5.14
- React Router 6.17
- Axios
- i18next for multilingual support (English/Tamil)

### Backend

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Mongoose ODM

### Exports

- Excel Export (ExcelJS)
- PDF Export (PDFKit)

## Features

### 1. Authentication Module

- User registration and login
- JWT-based authentication
- Role-based access control (Admin/Staff)
- User profile management

### 2. Ingredient Management

- Add, edit, delete, and search ingredients
- Store ingredient data in English and Tamil
- Multiple units (kg, gm, liter, ml, pcs, dozen, box)
- Ingredient categories
- Current rate tracking
- Pagination and filtering

### 3. Menu Management

- Create and manage menu items
- Bilingual support (English/Tamil)
- Menu categories (Breakfast, Lunch, Dinner, Snacks, Sweets)
- Active/Inactive status management

### 4. Recipe/Formula Management

- Create recipes based on menu items
- Define base members count (default portion size)
- Add multiple ingredients to recipes
- Track ingredient quantities

### 5. Cost Estimation

- Automatic recipe scaling based on guest count
- Ingredient consolidation for multiple menu items
- Raw material cost calculation
- Additional costs (Labour, Gas, Transport, Miscellaneous)
- Profit margin calculation
- Grand total estimation

### 6. Reports and Analytics

- Estimation history
- Filter by date range
- Filter by customer
- Cost analysis reports

### 7. Exports

- Excel export with multiple sheets
- PDF export for professional printing
- Formatted reports with calculations

### 8. Dashboard

- Key statistics (Total Ingredients, Menus, Recipes, Estimations)
- Recent estimations
- Cost analysis charts

## Directory Structure

```
kasikannu/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── jwt.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── ingredientController.js
│   │   │   ├── menuController.js
│   │   │   ├── recipeController.js
│   │   │   └── estimationController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Ingredient.js
│   │   │   ├── Menu.js
│   │   │   ├── Recipe.js
│   │   │   └── Estimation.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── ingredientService.js
│   │   │   ├── menuService.js
│   │   │   ├── recipeService.js
│   │   │   └── estimationService.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── ingredientRoutes.js
│   │   │   ├── menuRoutes.js
│   │   │   ├── recipeRoutes.js
│   │   │   └── estimationRoutes.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── validators/
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   └── calculation.js
│   │   ├── exports/
│   │   │   ├── excelExport.js
│   │   │   └── pdfExport.js
│   │   ├── seeds/
│   │   │   └── seedData.js
│   │   └── server.js
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.js
│   │   │   ├── Sidebar.js
│   │   │   ├── ProtectedRoute.js
│   │   │   ├── DataTable.js
│   │   │   └── IngredientDialog.js
│   │   ├── pages/
│   │   │   ├── AuthPage.js
│   │   │   ├── Dashboard.js
│   │   │   ├── IngredientsPage.js
│   │   │   ├── MenusPage.js
│   │   │   ├── RecipesPage.js
│   │   │   ├── EstimationsPage.js
│   │   │   ├── ReportsPage.js
│   │   │   ├── ProfilePage.js
│   │   │   └── UnauthorizedPage.js
│   │   ├── services/
│   │   │   ├── axiosConfig.js
│   │   │   ├── authService.js
│   │   │   ├── ingredientService.js
│   │   │   ├── menuService.js
│   │   │   ├── recipeService.js
│   │   │   └── estimationService.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── ThemeContext.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useTheme.js
│   │   ├── locales/
│   │   │   ├── i18n.js
│   │   │   ├── en.json
│   │   │   └── ta.json
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
└── README.md
```

## Installation Guide

### Prerequisites

- Node.js (v16+)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file from example:

```bash
cp .env.example .env
```

4. Update `.env` with your configuration:

```
MONGO_URI=mongodb://localhost:27017/catering_cost_estimation
PORT=5000
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:3000
COMPANY_NAME=Your Catering Business
```

5. Seed database (optional):

```bash
npm run seed
```

6. Start backend server:

```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file from example:

```bash
cp .env.example .env
```

4. Update `.env`:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_COMPANY_NAME=Catering Cost Estimation System
```

5. Start frontend:

```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Ingredients

- `GET /api/ingredients` - List all ingredients (with pagination)
- `GET /api/ingredients/:id` - Get ingredient by ID
- `POST /api/ingredients` - Create ingredient (Admin only)
- `PUT /api/ingredients/:id` - Update ingredient (Admin only)
- `DELETE /api/ingredients/:id` - Delete ingredient (Admin only)
- `GET /api/ingredients/search?q=query` - Search ingredients

### Menus

- `GET /api/menus` - List all menus
- `GET /api/menus/:id` - Get menu by ID
- `POST /api/menus` - Create menu (Admin only)
- `PUT /api/menus/:id` - Update menu (Admin only)
- `DELETE /api/menus/:id` - Delete menu (Admin only)
- `GET /api/menus/search?q=query` - Search menus

### Recipes

- `GET /api/recipes` - List all recipes
- `GET /api/recipes/:id` - Get recipe by ID
- `GET /api/recipes/menu/:menuId` - Get recipe by menu ID
- `POST /api/recipes` - Create recipe (Admin only)
- `PUT /api/recipes/:id` - Update recipe (Admin only)
- `DELETE /api/recipes/:id` - Delete recipe (Admin only)

### Estimations

- `GET /api/estimations` - List estimations
- `GET /api/estimations/:id` - Get estimation by ID
- `POST /api/estimations` - Create estimation
- `PUT /api/estimations/:id` - Update estimation
- `DELETE /api/estimations/:id` - Delete estimation (Admin only)
- `GET /api/estimations/:id/export/excel` - Export to Excel
- `GET /api/estimations/:id/export/pdf` - Export to PDF
- `GET /api/estimations/report/date-range` - Report by date range
- `GET /api/estimations/report/customer` - Report by customer

## Demo Credentials

Admin:

- Email: admin@example.com
- Password: admin123

Staff:

- Email: staff@example.com
- Password: staff123

## MongoDB Collections

### Users

```json
{
  "_id": ObjectId,
  "username": String,
  "email": String,
  "password": String (hashed),
  "firstName": String,
  "lastName": String,
  "role": "admin|staff",
  "phone": String,
  "isActive": Boolean,
  "lastLogin": Date,
  "createdAt": Date,
  "updatedAt": Date
}
```

### Ingredients

```json
{
  "_id": ObjectId,
  "name_en": String,
  "name_ta": String,
  "unit": "kg|gm|liter|ml|pcs|dozen|box",
  "currentRate": Number,
  "category": String,
  "status": "active|inactive",
  "description": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

### Menus

```json
{
  "_id": ObjectId,
  "name_en": String,
  "name_ta": String,
  "category": "breakfast|lunch|dinner|snacks|sweets",
  "description_en": String,
  "description_ta": String,
  "status": "active|inactive",
  "createdAt": Date,
  "updatedAt": Date
}
```

### Recipes

```json
{
  "_id": ObjectId,
  "menuId": ObjectId,
  "menuName_en": String,
  "menuName_ta": String,
  "baseMembers": Number,
  "ingredients": [
    {
      "ingredientId": ObjectId,
      "ingredientName_en": String,
      "ingredientName_ta": String,
      "quantity": Number,
      "unit": String
    }
  ],
  "status": "active|inactive",
  "createdAt": Date,
  "updatedAt": Date
}
```

### Estimations

```json
{
  "_id": ObjectId,
  "customerName": String,
  "mobileNumber": String,
  "eventDate": Date,
  "guestCount": Number,
  "selectedMenus": [{menuId, menuName_en, menuName_ta}],
  "ingredients": [{ingredientId, name, unit, requiredQty, rate, amount}],
  "rawMaterialCost": Number,
  "additionalCost": {
    "labourCost": Number,
    "gasCost": Number,
    "transportCost": Number,
    "miscellaneousCost": Number
  },
  "profitMargin": Number,
  "profitAmount": Number,
  "grandTotal": Number,
  "status": "draft|confirmed|cancelled",
  "createdBy": ObjectId,
  "createdAt": Date,
  "updatedAt": Date
}
```

## Cost Calculation Formula

### Ingredient Quantity Calculation

```
Required Qty = (Base Ingredient Qty × Guest Count) / Base Members
```

### Ingredient Amount Calculation

```
Amount = Required Qty × Current Rate
```

### Total Cost Calculation

```
Raw Material Cost = Sum of all ingredient amounts
Additional Cost = Labour + Gas + Transport + Miscellaneous
Profit Amount = (Raw Material Cost + Additional Cost) × (Profit Margin % / 100)
Grand Total = Raw Material Cost + Additional Cost + Profit Amount
```

## Multilingual Support

The application supports English and Tamil through i18next.

- Language switching available in the navigation bar
- All labels, forms, and reports are bilingual
- Language preference is saved in local storage
- Database stores bilingual content (name_en, name_ta)

## Best Practices

1. **Authentication**: Always validate tokens on the backend
2. **Database Validation**: Use Joi validators for input validation
3. **Error Handling**: Comprehensive error messages for debugging
4. **Code Organization**: Clean separation of concerns (routes, controllers, services)
5. **Reusable Components**: Create reusable React components for DRY code
6. **API Documentation**: All endpoints documented with request/response examples
7. **Environment Variables**: Sensitive data stored in .env files
8. **Security**: Password hashing with bcrypt, JWT for authentication

## Deployment

### Backend Deployment (Heroku/Railway)

1. Push to git repository
2. Connect to deployment service
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)

1. Build production version: `npm run build`
2. Deploy build folder
3. Set API URL in environment variables

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB is running
   - Verify connection string in .env

2. **CORS Error**
   - Check CORS_ORIGIN in backend .env
   - Ensure frontend URL matches

3. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token expiration

4. **Export Issues**
   - Ensure uploads directory exists
   - Check file permissions

## Future Enhancements

- Payment gateway integration
- Email notifications
- Advanced analytics and charts
- Bulk import/export
- API rate limiting
- Two-factor authentication
- Mobile app
- Inventory management
- Employee management
- Order management system

## License

ISC

## Support

For issues and support, please refer to the documentation or contact the development team.
