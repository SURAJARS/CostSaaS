# Backend Setup and Configuration Guide

## Overview

This document provides detailed instructions for setting up and running the Catering Cost Estimation backend server.

## Prerequisites

- Node.js v16+ ([Download](https://nodejs.org/))
- MongoDB v4.4+ (Local or Atlas cloud)
- npm or yarn package manager

## Installation Steps

### 1. Extract and Navigate

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend root directory:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/catering_cost_estimation
MONGO_USER=
MONGO_PASSWORD=

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_very_secure_secret_key_change_this
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Company Configuration
COMPANY_NAME=Your Catering Business Name

# Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10000000
```

### 4. Database Setup

#### Option A: Local MongoDB

```bash
# On Windows
mongod

# On macOS/Linux
brew services start mongodb-community
```

#### Option B: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update MONGO_URI in .env

### 5. Seed Initial Data (Optional)

```bash
npm run seed
```

This creates:

- Admin user (admin@example.com / admin123)
- Staff user (staff@example.com / staff123)
- Sample ingredients
- Sample menus
- Sample recipes

### 6. Start the Server

**Development Mode (with auto-reload)**

```bash
npm run dev
```

**Production Mode**

```bash
npm start
```

Server will start on http://localhost:5000

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js        # MongoDB connection
│   │   └── jwt.js             # JWT utilities
│   ├── controllers/           # Request handlers
│   ├── models/                # Database schemas
│   ├── services/              # Business logic
│   ├── routes/                # API routes
│   ├── middleware/            # Custom middleware
│   ├── validators/            # Input validation
│   ├── utils/                 # Helper functions
│   ├── exports/               # Export generators (Excel, PDF)
│   ├── seeds/                 # Database seeders
│   └── server.js              # Main server file
├── uploads/                   # Generated PDF files
├── .env.example               # Environment template
├── .gitignore
└── package.json
```

## Key Directories Explained

### config/

- **database.js**: Mongoose connection configuration
- **jwt.js**: JWT token generation and verification

### controllers/

Handle incoming HTTP requests:

- `authController.js`: User authentication
- `ingredientController.js`: Ingredient CRUD operations
- `menuController.js`: Menu management
- `recipeController.js`: Recipe management
- `estimationController.js`: Estimation creation and exports

### models/

Mongoose schemas:

- `User.js`: User authentication and profile
- `Ingredient.js`: Ingredient master data
- `Menu.js`: Menu items
- `Recipe.js`: Recipe formulas
- `Estimation.js`: Cost estimations

### services/

Business logic layer:

- Authentication logic
- Ingredient operations
- Menu operations
- Recipe management
- Estimation calculations and consolidation

### routes/

API endpoint definitions:

- `/api/auth`
- `/api/ingredients`
- `/api/menus`
- `/api/recipes`
- `/api/estimations`

### middleware/

- **auth.js**: JWT verification and role-based access control
- **errorHandler.js**: Global error handling

### validators/

Input validation using Joi schema validation

### utils/

- **calculation.js**: Cost calculation formulas

### exports/

- **excelExport.js**: Excel report generation
- **pdfExport.js**: PDF report generation

## API Authentication

All protected endpoints require:

```
Authorization: Bearer <JWT_TOKEN>
```

Token obtained from login endpoint and valid for 7 days.

## Common npm Scripts

```bash
npm start       # Start server in production mode
npm run dev     # Start with nodemon (auto-reload)
npm run seed    # Seed database with sample data
npm test        # Run tests (if configured)
```

## MongoDB Indexing

The application automatically creates indexes on:

- User emails
- Ingredient names and categories
- Menu names and categories
- Recipe status and menuId
- Estimation customer names, dates, and status

## Error Handling

The application includes:

- Validation error handling (400)
- Authentication error handling (401)
- Authorization error handling (403)
- Not found error handling (404)
- Server error handling (500)
- Duplicate key error handling (11000)

All errors return JSON responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Testing Endpoints with Postman

1. **Register**

   ```
   POST http://localhost:5000/api/auth/register
   Content-Type: application/json

   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "password123",
     "firstName": "Test",
     "lastName": "User"
   }
   ```

2. **Login**

   ```
   POST http://localhost:5000/api/auth/login
   Content-Type: application/json

   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   ```

3. **Get Ingredients** (with token)
   ```
   GET http://localhost:5000/api/ingredients
   Authorization: Bearer <token>
   ```

## Performance Tips

1. **Database Indexes**: Already configured on frequently queried fields
2. **Pagination**: Use pagination for large datasets
3. **Caching**: Consider implementing Redis for frequently accessed data
4. **Connection Pooling**: MongoDB connection pooling is auto-configured
5. **Error Logging**: Implement proper logging for production

## Security Considerations

1. **Environment Variables**: Never commit .env file
2. **Password Hashing**: Bcrypt with salt rounds (10)
3. **JWT Expiration**: Set reasonable expiration times
4. **Input Validation**: All inputs validated with Joi
5. **CORS**: Restricted to frontend origin
6. **Rate Limiting**: Consider implementing for production
7. **HTTPS**: Use in production environment

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Issues

- Check MongoDB is running
- Verify connection string
- Check network access (for Atlas)

### JWT Token Issues

- Check JWT_SECRET is set
- Verify token format in Authorization header
- Check token expiration

## Deployment

### Heroku Deployment

```bash
heroku create your-app-name
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

### Railway/Render Deployment

Similar process, connect GitHub repository and set environment variables.

## Monitoring

For production, implement:

- Application monitoring (New Relic, Datadog)
- Error tracking (Sentry)
- Performance monitoring
- Database monitoring

## Support and Debugging

Enable detailed logging:

```javascript
// In server.js
app.use(morgan("dev")); // Already included
```

Check logs for detailed request/response information.
