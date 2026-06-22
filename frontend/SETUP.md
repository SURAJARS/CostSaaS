# Frontend Setup and Configuration Guide

## Overview

This document provides detailed instructions for setting up and running the Catering Cost Estimation frontend application.

## Prerequisites

- Node.js v16+ ([Download](https://nodejs.org/))
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation Steps

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_COMPANY_NAME=Catering Cost Estimation System
```

### 4. Start Development Server

```bash
npm start
```

Application will open at http://localhost:3000

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/           # Reusable React components
│   │   ├── Navigation.js
│   │   ├── Sidebar.js
│   │   ├── ProtectedRoute.js
│   │   ├── DataTable.js
│   │   └── IngredientDialog.js
│   ├── pages/                # Page components
│   │   ├── AuthPage.js
│   │   ├── Dashboard.js
│   │   ├── IngredientsPage.js
│   │   ├── MenusPage.js
│   │   ├── RecipesPage.js
│   │   ├── EstimationsPage.js
│   │   ├── ReportsPage.js
│   │   ├── ProfilePage.js
│   │   └── UnauthorizedPage.js
│   ├── services/             # API service calls
│   │   ├── axiosConfig.js
│   │   ├── authService.js
│   │   ├── ingredientService.js
│   │   ├── menuService.js
│   │   ├── recipeService.js
│   │   └── estimationService.js
│   ├── context/              # React Context for state management
│   │   ├── AuthContext.js
│   │   └── ThemeContext.js
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.js
│   │   └── useTheme.js
│   ├── locales/              # i18n translations
│   │   ├── i18n.js
│   │   ├── en.json
│   │   └── ta.json
│   ├── utils/                # Helper functions
│   │   └── helpers.js
│   ├── App.js                # Main app component
│   └── index.js              # React DOM render
├── .env.example
├── .gitignore
└── package.json
```

## Key Directories Explained

### components/

Reusable React components:

- **Navigation.js**: Top app bar with language switcher
- **Sidebar.js**: Navigation drawer
- **ProtectedRoute.js**: Route guard for authenticated pages
- **DataTable.js**: Reusable table component with pagination
- **IngredientDialog.js**: Ingredient form dialog

### pages/

Page-level components:

- **AuthPage.js**: Login and registration
- **Dashboard.js**: Dashboard with statistics
- **IngredientsPage.js**: Ingredient CRUD
- **MenusPage.js**: Menu management
- **RecipesPage.js**: Recipe management
- **EstimationsPage.js**: Estimation creation and viewing
- **ReportsPage.js**: Report generation

### services/

API communication:

```javascript
// Example: ingredientService.js
getIngredients(page, limit);
searchIngredients(query, page, limit);
createIngredient(data);
updateIngredient(id, data);
deleteIngredient(id);
```

### context/

Global state management:

- **AuthContext.js**: User authentication state
- **ThemeContext.js**: Dark/light mode theme

### hooks/

Custom React hooks:

- **useAuth()**: Access authentication context
- **useTheme()**: Access theme context

### locales/

Multilingual support:

- **en.json**: English translations
- **ta.json**: Tamil translations
- Language switcher in Navigation component

### utils/

Helper functions:

```javascript
formatDate(date);
formatCurrency(amount);
downloadFile(blob, filename);
validateEmail(email);
validatePhoneNumber(phone);
```

## Common npm Scripts

```bash
npm start       # Start development server
npm build       # Build for production
npm test        # Run tests
npm eject       # Eject from create-react-app (irreversible)
```

## Available Routes

```
/login                      # Login/Registration
/dashboard                  # Dashboard (protected)
/ingredients                # Ingredients management
/menus                      # Menus management
/recipes                    # Recipes management
/estimations                # Estimations
/reports                    # Reports
/profile                    # User profile
/unauthorized               # 403 Unauthorized
```

## Authentication Flow

1. **Login**
   - User enters credentials on `/login`
   - Calls `/api/auth/login`
   - Receives JWT token
   - Token stored in localStorage
   - Redirected to dashboard

2. **Authorization**
   - Protected routes checked with ProtectedRoute component
   - Token included in all API calls via axiosConfig
   - Automatic logout on 401 response

3. **Logout**
   - Token removed from localStorage
   - User redirected to login

## Material UI Customization

Theme is configured in `App.js`:

```javascript
const theme = createTheme({
  palette: {
    mode: isDarkMode ? "dark" : "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
    success: { main: "#4caf50" },
    error: { main: "#f44336" },
  },
});
```

## Multilingual Support (i18next)

### How to Use Translations

```javascript
import { useTranslation } from "react-i18next";

function Component() {
  const { t, i18n } = useTranslation();

  return <h1>{t("common.home")}</h1>;
}
```

### Add New Translation

1. Edit `src/locales/en.json` for English
2. Edit `src/locales/ta.json` for Tamil
3. Use in components with `t('key')`

### Change Language

```javascript
i18n.changeLanguage("ta"); // Switch to Tamil
i18n.changeLanguage("en"); // Switch to English
```

## Building for Production

```bash
npm run build
```

Creates optimized production build in `build/` directory.

### Deployment Options

**Vercel (Recommended)**

```bash
npm i -g vercel
vercel
```

**Netlify**

- Connect GitHub repository
- Set build command: `npm run build`
- Set publish directory: `build`

**Traditional Hosting**

- Copy build/ contents to web server
- Configure server to route all to index.html

## API Integration

Axios is configured in `src/services/axiosConfig.js`:

```javascript
// Automatically adds:
// - Content-Type: application/json
// - Authorization: Bearer <token>

// Error handling:
// - 401: Auto logout
// - 4xx/5xx: Return error
```

## Performance Optimization

1. **Code Splitting**: React Router lazy loading
2. **Lazy Loading**: Components loaded on demand
3. **Memoization**: React.memo for expensive components
4. **Local Storage**: Cache user preferences

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Debugging Tips

### React DevTools

- Install React DevTools browser extension
- Inspect component hierarchy
- Monitor state and props

### Network Debugging

- Open Browser DevTools (F12)
- Check Network tab for API calls
- Verify response status and data

### Console Logging

```javascript
console.log("Debug message");
console.error("Error message");
console.warn("Warning message");
```

## Common Issues

### Blank Page After Login

- Check browser console for errors
- Verify API URL in .env
- Check authentication token

### API Call Failures

- Verify backend is running
- Check CORS settings
- Verify token is valid

### Styling Issues

- Clear browser cache (Ctrl+Shift+Del)
- Restart development server
- Check MUI version compatibility

## Environment Variables

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# App Configuration
REACT_APP_COMPANY_NAME=Catering Cost Estimation System

# Analytics (optional)
REACT_APP_GA_ID=your_google_analytics_id
```

## Accessibility Features

- Keyboard navigation support
- ARIA labels on interactive elements
- Color contrast compliance
- Screen reader support

## Testing (Optional Setup)

```bash
npm test
```

## Dependencies Overview

- **react** (18.2.0): UI framework
- **react-router-dom** (6.17.0): Routing
- **@mui/material** (5.14.0): UI components
- **axios** (1.6.1): HTTP client
- **i18next** (23.7.0): Internationalization
- **react-i18next** (13.5.0): React i18n binding
- **date-fns** (2.30.0): Date utilities
- **exceljs** (4.3.0): Excel export
- **pdfkit** (0.13.0): PDF export

## Support and Resources

- React Documentation: https://react.dev
- Material UI: https://mui.com
- i18next: https://www.i18next.com
- Axios: https://axios-http.com

## Next Steps

1. Start development server: `npm start`
2. Open http://localhost:3000
3. Login with demo credentials
4. Explore features
5. Customize as needed
