require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Ingredient = require('../models/Ingredient');
const Menu = require('../models/Menu');
const Recipe = require('../models/Recipe');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/catering_cost_estimation', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Ingredient.deleteMany({});
    await Menu.deleteMany({});
    await Recipe.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      phone: '9000000000'
    });

    const staffUser = new User({
      username: 'staff',
      email: 'staff@example.com',
      password: 'staff123',
      firstName: 'Staff',
      lastName: 'User',
      role: 'staff',
      phone: '9000000001'
    });

    await adminUser.save();
    await staffUser.save();
    console.log('Users created');

    // Create ingredients
    const ingredients = [
      { name_en: 'Rice', name_ta: 'அரிசி', unit: 'kg', currentRate: 50, category: 'grains' },
      { name_en: 'Urad Dal', name_ta: 'உளுண்டு', unit: 'kg', currentRate: 80, category: 'dal' },
      { name_en: 'Toor Dal', name_ta: 'துவரம்', unit: 'kg', currentRate: 120, category: 'dal' },
      { name_en: 'Salt', name_ta: 'உப்பு', unit: 'gm', currentRate: 20, category: 'condiments' },
      { name_en: 'Oil', name_ta: 'எண்ணெய்', unit: 'liter', currentRate: 120, category: 'oil' },
      { name_en: 'Onion', name_ta: 'வெங்காயம்', unit: 'kg', currentRate: 60, category: 'vegetables' },
      { name_en: 'Tomato', name_ta: 'தக்காளி', unit: 'kg', currentRate: 40, category: 'vegetables' },
      { name_en: 'Turmeric', name_ta: 'மஞ்சள்', unit: 'gm', currentRate: 100, category: 'spices' },
      { name_en: 'Chili Powder', name_ta: 'மிளகாய்', unit: 'gm', currentRate: 120, category: 'spices' },
      { name_en: 'Coriander Seeds', name_ta: 'கொத்தமல்லி', unit: 'gm', currentRate: 150, category: 'spices' }
    ];

    const savedIngredients = await Ingredient.insertMany(ingredients);
    console.log('Ingredients created');

    // Create menus
    const menus = [
      { name_en: 'Idly', name_ta: 'இட்லி', category: 'breakfast' },
      { name_en: 'Dosa', name_ta: 'தோசை', category: 'breakfast' },
      { name_en: 'Sambar', name_ta: 'சாம்பார்', category: 'lunch' },
      { name_en: 'Chutney', name_ta: 'சட்னி', category: 'lunch' },
      { name_en: 'Vada', name_ta: 'வடை', category: 'snacks' },
      { name_en: 'Kesari', name_ta: 'கேசரி', category: 'sweets' }
    ];

    const savedMenus = await Menu.insertMany(menus);
    console.log('Menus created');

    // Create recipes for all menus
    const recipes = [
      {
        menuId: savedMenus[0]._id,
        menuName_en: 'Idly',
        menuName_ta: 'இட்லி',
        baseMembers: 10,
        ingredients: [
          {
            ingredientId: savedIngredients[1]._id,
            ingredientName_en: 'Urad Dal',
            ingredientName_ta: 'உளுண்டு',
            quantity: 0.5,
            unit: 'kg'
          },
          {
            ingredientId: savedIngredients[0]._id,
            ingredientName_en: 'Rice',
            ingredientName_ta: 'அரிசி',
            quantity: 1,
            unit: 'kg'
          },
          {
            ingredientId: savedIngredients[3]._id,
            ingredientName_en: 'Salt',
            ingredientName_ta: 'உப்பு',
            quantity: 10,
            unit: 'gm'
          }
        ]
      },
      {
        menuId: savedMenus[1]._id,
        menuName_en: 'Dosa',
        menuName_ta: 'தோசை',
        baseMembers: 10,
        ingredients: [
          {
            ingredientId: savedIngredients[1]._id,
            ingredientName_en: 'Urad Dal',
            ingredientName_ta: 'உளுண்டு',
            quantity: 0.3,
            unit: 'kg'
          },
          {
            ingredientId: savedIngredients[0]._id,
            ingredientName_en: 'Rice',
            ingredientName_ta: 'அரிசி',
            quantity: 0.5,
            unit: 'kg'
          },
          {
            ingredientId: savedIngredients[4]._id,
            ingredientName_en: 'Oil',
            ingredientName_ta: 'எண்ணெய்',
            quantity: 0.1,
            unit: 'liter'
          },
          {
            ingredientId: savedIngredients[3]._id,
            ingredientName_en: 'Salt',
            ingredientName_ta: 'உப்பு',
            quantity: 10,
            unit: 'gm'
          }
        ]
      },
      {
        menuId: savedMenus[2]._id,
        menuName_en: 'Sambar',
        menuName_ta: 'சாம்பார்',
        baseMembers: 10,
        ingredients: [
          {
            ingredientId: savedIngredients[2]._id,
            ingredientName_en: 'Toor Dal',
            ingredientName_ta: 'துவரம்',
            quantity: 1,
            unit: 'kg'
          },
          {
            ingredientId: savedIngredients[5]._id,
            ingredientName_en: 'Onion',
            ingredientName_ta: 'வெங்காயம்',
            quantity: 0.5,
            unit: 'kg'
          },
          {
            ingredientId: savedIngredients[6]._id,
            ingredientName_en: 'Tomato',
            ingredientName_ta: 'தக்காளி',
            quantity: 0.5,
            unit: 'kg'
          },
          {
            ingredientId: savedIngredients[3]._id,
            ingredientName_en: 'Salt',
            ingredientName_ta: 'உப்பு',
            quantity: 50,
            unit: 'gm'
          }
        ]
      },
      {
        menuId: savedMenus[3]._id,
        menuName_en: 'Chutney',
        menuName_ta: 'சட்னி',
        baseMembers: 10,
        ingredients: [
          {
            ingredientId: savedIngredients[5]._id,
            ingredientName_en: 'Onion',
            ingredientName_ta: 'வெங்காயம்',
            quantity: 0.2,
            unit: 'kg'
          },
          {
            ingredientId: savedIngredients[7]._id,
            ingredientName_en: 'Turmeric',
            ingredientName_ta: 'மஞ்சள்',
            quantity: 10,
            unit: 'gm'
          },
          {
            ingredientId: savedIngredients[8]._id,
            ingredientName_en: 'Chili Powder',
            ingredientName_ta: 'மிளகாய்',
            quantity: 20,
            unit: 'gm'
          }
        ]
      },
      {
        menuId: savedMenus[4]._id,
        menuName_en: 'Vada',
        menuName_ta: 'வடை',
        baseMembers: 10,
        ingredients: [
          {
            ingredientId: savedIngredients[1]._id,
            ingredientName_en: 'Urad Dal',
            ingredientName_ta: 'உளுண்டு',
            quantity: 0.8,
            unit: 'kg'
          },
          {
            ingredientId: savedIngredients[5]._id,
            ingredientName_en: 'Onion',
            ingredientName_ta: 'வெங்காயம்',
            quantity: 0.3,
            unit: 'kg'
          },
          {
            ingredientId: savedIngredients[3]._id,
            ingredientName_en: 'Salt',
            ingredientName_ta: 'உப்பு',
            quantity: 15,
            unit: 'gm'
          },
          {
            ingredientId: savedIngredients[4]._id,
            ingredientName_en: 'Oil',
            ingredientName_ta: 'எண்ணெய்',
            quantity: 0.2,
            unit: 'liter'
          }
        ]
      },
      {
        menuId: savedMenus[5]._id,
        menuName_en: 'Kesari',
        menuName_ta: 'கேசரி',
        baseMembers: 10,
        ingredients: [
          {
            ingredientId: savedIngredients[0]._id,
            ingredientName_en: 'Rice',
            ingredientName_ta: 'அரிசி',
            quantity: 1,
            unit: 'kg'
          },
          {
            ingredientId: savedIngredients[4]._id,
            ingredientName_en: 'Oil',
            ingredientName_ta: 'எண்ணெய்',
            quantity: 0.2,
            unit: 'liter'
          },
          {
            ingredientId: savedIngredients[7]._id,
            ingredientName_en: 'Turmeric',
            ingredientName_ta: 'மஞ்சள்',
            quantity: 5,
            unit: 'gm'
          },
          {
            ingredientId: savedIngredients[3]._id,
            ingredientName_en: 'Salt',
            ingredientName_ta: 'உப்பு',
            quantity: 20,
            unit: 'gm'
          }
        ]
      }
    ];

    await Recipe.insertMany(recipes);
    console.log('Recipes created');

    console.log('Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
