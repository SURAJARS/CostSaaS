const Joi = require('joi');

const validateUser = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    role: Joi.string().valid('admin', 'staff'),
    phone: Joi.string()
  });

  return schema.validate(data);
};

const validateIngredient = (data) => {
  const schema = Joi.object({
    name_en: Joi.string().required(),
    name_ta: Joi.string().required(),
    unit: Joi.string().valid('kg', 'gm', 'liter', 'ml', 'pcs', 'dozen', 'box').required(),
    currentRate: Joi.number().min(0).required(),
    category: Joi.string().valid('dal', 'spices', 'oil', 'vegetables', 'grains', 'dairy', 'condiments', 'others').required(),
    status: Joi.string().valid('active', 'inactive'),
    description: Joi.string()
  });

  return schema.validate(data);
};

const validateMenu = (data) => {
  const schema = Joi.object({
    name_en: Joi.string().required(),
    name_ta: Joi.string().required(),
    category: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snacks', 'sweets').required(),
    description_en: Joi.string(),
    description_ta: Joi.string(),
    status: Joi.string().valid('active', 'inactive')
  });

  return schema.validate(data);
};

const validateRecipe = (data) => {
  const schema = Joi.object({
    menuId: Joi.string().required(),
    baseMembers: Joi.number().min(1).required(),
    ingredients: Joi.array().items(
      Joi.object({
        ingredientId: Joi.string().required(),
        quantity: Joi.number().min(0).required(),
        unit: Joi.string().required()
      })
    ).required(),
    status: Joi.string().valid('active', 'inactive')
  });

  return schema.validate(data);
};

const validateEstimation = (data) => {
  const schema = Joi.object({
    customerName: Joi.string().required(),
    mobileNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
    eventDate: Joi.date().required(),
    guestCount: Joi.number().min(1).required(),
    selectedMenus: Joi.array().items(
      Joi.object({
        menuId: Joi.string().required(),
        quantity: Joi.number().min(1)
      })
    ).required(),
    labourCost: Joi.number().min(0).default(0),
    gasCost: Joi.number().min(0).default(0),
    transportCost: Joi.number().min(0).default(0),
    miscellaneousCost: Joi.number().min(0).default(0),
    profitMargin: Joi.number().min(0).default(0)
  }).unknown(true);

  return schema.validate(data);
};

module.exports = {
  validateUser,
  validateIngredient,
  validateMenu,
  validateRecipe,
  validateEstimation
};
