$loginBody = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
$token = $loginResponse.data.token

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Test: Edit recipe with saved expenses"
Write-Host "======================================"

Write-Host ""
Write-Host "Step 1: Get recipe that already has expenses..."
$getResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/recipes?page=1&limit=1" -Method Get -Headers $headers
$recipe = $getResponse.data[0]
$recipeId = $recipe._id

Write-Host "Recipe: $($recipe.menuName_en)"
Write-Host "Current expenses: $($recipe.expenses.Count)"
if ($recipe.expenses) {
    foreach ($exp in $recipe.expenses) {
        Write-Host "  - Amount: $($exp.amount)"
    }
}

Write-Host ""
Write-Host "Step 2: Update the recipe (with same expense)..."
$updateBody = @{
    menuId = $recipe.menuId._id
    baseMembers = $recipe.baseMembers + 5
    ingredients = @(
        @{
            ingredientId = $recipe.ingredients[0].ingredientId._id
            ingredientName_en = $recipe.ingredients[0].ingredientName_en
            ingredientName_ta = $recipe.ingredients[0].ingredientName_ta
            quantity = $recipe.ingredients[0].quantity
            unit = $recipe.ingredients[0].unit
        }
    )
    expenses = $recipe.expenses
    status = "active"
} | ConvertTo-Json -Depth 5

$updateResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/recipes/$recipeId" -Method Put -ContentType "application/json" -Body $updateBody -Headers $headers
Write-Host "Updated base members to: $($updateResponse.data.baseMembers)"

Write-Host ""
Write-Host "Step 3: Fetch recipe again to verify expenses are still there..."
$fetchResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/recipes/$recipeId" -Method Get -Headers $headers
$verifyRecipe = $fetchResponse.data

Write-Host "Recipe: $($verifyRecipe.menuName_en)"
Write-Host "Base Members: $($verifyRecipe.baseMembers)"
$expenseCount = if ($verifyRecipe.expenses) { $verifyRecipe.expenses.Count } else { 0 }
Write-Host "Expenses count: $expenseCount"

if ($expenseCount -gt 0) {
    Write-Host "SUCCESS - Expenses persisted after edit"
    foreach ($expense in $verifyRecipe.expenses) {
        Write-Host "  - Amount: $($expense.amount)"
    }
} else {
    Write-Host "ERROR - Expenses were lost after edit"
}
