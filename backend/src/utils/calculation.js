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
  return ingredients.map(ing => ({
    ...ing,
    amount: ing.requiredQty * ing.currentRate
  }));
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
  calculateRequiredQty,
  consolidateIngredients,
  calculateIngredientCost,
  calculateRawMaterialCost,
  calculateAdditionalCostTotal,
  calculateGrandTotal
};
