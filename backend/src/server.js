require('dotenv').config();
console.log(process.env.MONGODB_URI);
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const menuRoutes = require('./routes/menuRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const estimationRoutes = require('./routes/estimationRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const comboRoutes = require('./routes/comboRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://cost-saa-s-nine.vercel.app',
  'https://kasikannu.vercel.app',
  'https://cost-saas-git-main-tamilmannan2020-9410s-projects.vercel.app',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/estimations', estimationRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/combos', comboRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0',() => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
