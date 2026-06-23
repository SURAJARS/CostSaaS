// Unit conversion function
const convertUnit = (quantity, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return quantity;

  // Conversion factors to base units (gm for weight, ml for volume)
  const weightConversions = { 'kg': 1000, 'gm': 1 };
  const volumeConversions = { 'liter': 1000, 'ml': 1 };
  const countUnits = { 'pcs': 1, 'dozen': 1, 'box': 1 };

  // Weight conversions (kg <-> gm)
  if (weightConversions[fromUnit] && weightConversions[toUnit]) {
    return (quantity * weightConversions[fromUnit]) / weightConversions[toUnit];
  }

  // Volume conversions (liter <-> ml)
  if (volumeConversions[fromUnit] && volumeConversions[toUnit]) {
    return (quantity * volumeConversions[fromUnit]) / volumeConversions[toUnit];
  }

  // Count units remain the same (no conversion between pcs, dozen, box)
  if (countUnits[fromUnit] && countUnits[toUnit]) {
    return quantity;
  }

  // No conversion possible between different unit types, return original
  return quantity;
};

// Calculate required quantity based on base recipe and guest count
const calculateRequiredQty = (baseQty, guestCount, baseMembers) => {
  return (baseQty * guestCount) / baseMembers;
};

// Consolidate ingredients from multiple menus
const consolidateIngredients = (menuIngredients, guestCount) => {
  const consolidated = {};

  menuIngredients.forEach(menu => {
    const { ingredients, baseMembers } = menu;
    
    ingredients.forEach(ingredient => {
      // Handle both populated objects and plain IDs
      const ingredientId = ingredient.ingredientId._id 
        ? ingredient.ingredientId._id.toString() 
        : ingredient.ingredientId.toString();
      const requiredQty = calculateRequiredQty(ingredient.quantity, guestCount, baseMembers);

      if (consolidated[ingredientId]) {
        consolidated[ingredientId].requiredQty += requiredQty;
      } else {
        consolidated[ingredientId] = {
          ingredientId,
          ingredientName_en: ingredient.ingredientName_en,
          ingredientName_ta: ingredient.ingredientName_ta,
          unit: ingredient.unit,
          requiredQty,
          currentRate: 0
        };
      }
    });
  });

  return Object.values(consolidated);
};

// Calculate cost for each ingredient
const calculateIngredientCost = (ingredients) => {
  return ingredients.map(ing => {
    // Convert required quantity from recipe unit to ingredient's base unit
    const convertedQty = convertUnit(ing.requiredQty, ing.recipeUnit, ing.ingredientUnit);
    const amount = convertedQty * ing.currentRate;
    return {
      ...ing,
      amount
    };
  });
};

// Calculate total raw material cost
const calculateRawMaterialCost = (ingredients) => {
  return ingredients.reduce((total, ing) => total + ing.amount, 0);
};

// Calculate additional costs total
const calculateAdditionalCostTotal = (additionalCost) => {
  return Object.values(additionalCost).reduce((total, cost) => total + cost, 0);
};

// Calculate grand total
const calculateGrandTotal = (rawMaterialCost, additionalCost, profitMargin) => {
  const additionalCostTotal = calculateAdditionalCostTotal(additionalCost);
  const finalCost = rawMaterialCost + additionalCostTotal;
  const profitAmount = (finalCost * profitMargin) / 100;
  return {
    finalCost,
    profitAmount,
    grandTotal: finalCost + profitAmount
  };
};

module.exports = {
  convertUnit,
  calculateRequiredQty,
  consolidateIngredients,
  calculateIngredientCost,
  calculateRawMaterialCost,
  calculateAdditionalCostTotal,
  calculateGrandTotal
};
