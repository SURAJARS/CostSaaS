# API Endpoints Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require:

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## Authentication Endpoints

### Register User

```
POST /auth/register
Content-Type: application/json
```

**Request Body:**

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9000000001"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "newuser",
    "email": "newuser@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "staff",
    "isActive": true,
    "createdAt": "2024-06-21T10:00:00Z"
  }
}
```

### Login

```
POST /auth/login
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "admin",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Profile

```
GET /auth/profile
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "phone": "9000000000",
    "lastLogin": "2024-06-21T10:00:00Z"
  }
}
```

### Update Profile

```
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Updated",
  "phone": "9000000002"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    /* Updated user object */
  }
}
```

---

## Ingredient Endpoints

### List Ingredients

```
GET /ingredients?page=1&limit=10&status=active
Authorization: Bearer <token>
```

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (active/inactive)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name_en": "Rice",
      "name_ta": "அரிசி",
      "unit": "kg",
      "currentRate": 50,
      "category": "grains",
      "status": "active",
      "createdAt": "2024-06-21T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Get Ingredient by ID

```
GET /ingredients/:id
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    /* Ingredient object */
  }
}
```

### Create Ingredient

```
POST /ingredients
Authorization: Bearer <token>
Content-Type: application/json
Role: admin
```

**Request Body:**

```json
{
  "name_en": "Salt",
  "name_ta": "உப்பு",
  "unit": "gm",
  "currentRate": 20,
  "category": "condiments",
  "status": "active",
  "description": "Common salt"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Ingredient created successfully",
  "data": {
    /* Created ingredient object */
  }
}
```

### Update Ingredient

```
PUT /ingredients/:id
Authorization: Bearer <token>
Content-Type: application/json
Role: admin
```

**Request Body:**

```json
{
  "currentRate": 25
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Ingredient updated successfully",
  "data": {
    /* Updated ingredient object */
  }
}
```

### Delete Ingredient

```
DELETE /ingredients/:id
Authorization: Bearer <token>
Role: admin
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Ingredient deleted successfully"
}
```

### Search Ingredients

```
GET /ingredients/search?q=rice&page=1&limit=10
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    /* Matching ingredients */
  ],
  "pagination": {
    /* Pagination info */
  }
}
```

---

## Menu Endpoints

### List Menus

```
GET /menus?page=1&limit=10&category=breakfast&status=active
Authorization: Bearer <token>
```

**Query Parameters:**

- `page`: Page number
- `limit`: Items per page
- `category`: Filter by category (breakfast/lunch/dinner/snacks/sweets)
- `status`: Filter by status

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name_en": "Idly",
      "name_ta": "இட்லி",
      "category": "breakfast",
      "status": "active",
      "createdAt": "2024-06-21T10:00:00Z"
    }
  ],
  "pagination": {
    /* Pagination info */
  }
}
```

### Get Menu by ID

```
GET /menus/:id
Authorization: Bearer <token>
```

### Create Menu

```
POST /menus
Authorization: Bearer <token>
Role: admin
Content-Type: application/json
```

**Request Body:**

```json
{
  "name_en": "Dosa",
  "name_ta": "தோசை",
  "category": "breakfast",
  "description_en": "Crispy rice pancake",
  "description_ta": "மெல்லிய அரிசி பான்கேக்",
  "status": "active"
}
```

### Update Menu

```
PUT /menus/:id
Authorization: Bearer <token>
Role: admin
```

### Delete Menu

```
DELETE /menus/:id
Authorization: Bearer <token>
Role: admin
```

### Search Menus

```
GET /menus/search?q=idly&page=1&limit=10
Authorization: Bearer <token>
```

---

## Recipe Endpoints

### List Recipes

```
GET /recipes?page=1&limit=10&status=active
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "menuId": {
        "_id": "507f1f77bcf86cd799439012",
        "name_en": "Idly",
        "name_ta": "இட்லி"
      },
      "baseMembers": 10,
      "ingredients": [
        {
          "ingredientId": "507f1f77bcf86cd799439013",
          "ingredientName_en": "Urad Dal",
          "quantity": 0.5,
          "unit": "kg"
        }
      ],
      "status": "active"
    }
  ],
  "pagination": {
    /* Pagination info */
  }
}
```

### Get Recipe by ID

```
GET /recipes/:id
Authorization: Bearer <token>
```

### Get Recipe by Menu ID

```
GET /recipes/menu/:menuId
Authorization: Bearer <token>
```

### Create Recipe

```
POST /recipes
Authorization: Bearer <token>
Role: admin
Content-Type: application/json
```

**Request Body:**

```json
{
  "menuId": "507f1f77bcf86cd799439012",
  "baseMembers": 10,
  "ingredients": [
    {
      "ingredientId": "507f1f77bcf86cd799439013",
      "quantity": 0.5,
      "unit": "kg"
    },
    {
      "ingredientId": "507f1f77bcf86cd799439014",
      "quantity": 1,
      "unit": "kg"
    }
  ],
  "status": "active"
}
```

### Update Recipe

```
PUT /recipes/:id
Authorization: Bearer <token>
Role: admin
```

### Delete Recipe

```
DELETE /recipes/:id
Authorization: Bearer <token>
Role: admin
```

---

## Estimation Endpoints

### List Estimations

```
GET /estimations?page=1&limit=10&status=confirmed
Authorization: Bearer <token>
```

**Query Parameters:**

- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status (draft/confirmed/cancelled)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "customerName": "John Doe",
      "mobileNumber": "9000000000",
      "eventDate": "2024-07-15T00:00:00Z",
      "guestCount": 150,
      "rawMaterialCost": 5000,
      "additionalCost": {
        "labourCost": 1000,
        "gasCost": 500,
        "transportCost": 300,
        "miscellaneousCost": 200
      },
      "profitMargin": 15,
      "profitAmount": 1185,
      "grandTotal": 8185,
      "status": "confirmed",
      "createdAt": "2024-06-21T10:00:00Z"
    }
  ],
  "pagination": {
    /* Pagination info */
  }
}
```

### Get Estimation by ID

```
GET /estimations/:id
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "customerName": "John Doe",
    "mobileNumber": "9000000000",
    "eventDate": "2024-07-15T00:00:00Z",
    "guestCount": 150,
    "selectedMenus": [
      {
        "menuId": "507f1f77bcf86cd799439012",
        "menuName_en": "Idly",
        "menuName_ta": "இட்லி"
      }
    ],
    "ingredients": [
      {
        "ingredientId": "507f1f77bcf86cd799439013",
        "ingredientName_en": "Urad Dal",
        "unit": "kg",
        "requiredQty": 7.5,
        "currentRate": 80,
        "amount": 600
      }
    ],
    "rawMaterialCost": 5000,
    "additionalCost": {
      /* ... */
    },
    "profitMargin": 15,
    "profitAmount": 1185,
    "grandTotal": 8185,
    "status": "confirmed",
    "createdBy": {
      /* User info */
    },
    "createdAt": "2024-06-21T10:00:00Z"
  }
}
```

### Create Estimation

```
POST /estimations
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "customerName": "John Doe",
  "mobileNumber": "9000000000",
  "eventDate": "2024-07-15",
  "guestCount": 150,
  "selectedMenus": [
    { "menuId": "507f1f77bcf86cd799439012" },
    { "menuId": "507f1f77bcf86cd799439013" }
  ],
  "additionalCost": {
    "labourCost": 1000,
    "gasCost": 500,
    "transportCost": 300,
    "miscellaneousCost": 200
  },
  "profitMargin": 15
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Estimation created successfully",
  "data": {
    /* Created estimation object */
  }
}
```

### Update Estimation

```
PUT /estimations/:id
Authorization: Bearer <token>
Content-Type: application/json
```

### Delete Estimation

```
DELETE /estimations/:id
Authorization: Bearer <token>
Role: admin
```

### Export to Excel

```
GET /estimations/:id/export/excel
Authorization: Bearer <token>
```

**Response:** Binary Excel file (.xlsx)

### Export to PDF

```
GET /estimations/:id/export/pdf
Authorization: Bearer <token>
```

**Response:** Binary PDF file (.pdf)

### Reports by Date Range

```
GET /estimations/report/date-range?startDate=2024-01-01&endDate=2024-06-30&page=1&limit=10
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    /* Array of estimations */
  ],
  "pagination": {
    /* Pagination info */
  }
}
```

### Reports by Customer

```
GET /estimations/report/customer?customerName=John&page=1&limit=10
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    /* Array of estimations */
  ],
  "pagination": {
    /* Pagination info */
  }
}
```

---

## Error Responses

### Validation Error (400)

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": ["Email is required", "Password must be at least 6 characters"]
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### Forbidden (403)

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### Not Found (404)

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Conflict (400) - Duplicate Key

```json
{
  "success": false,
  "message": "email already exists"
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Status Codes

- `200 OK`: Successful GET, PUT
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Rate Limiting (Optional)

For production, consider implementing:

- 100 requests per 15 minutes per IP
- 50 requests per minute for authentication endpoints
