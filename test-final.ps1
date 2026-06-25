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

Write-Host "Step 1: Getting expenses..."
$expensesResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/expenses" -Method Get -Headers $headers
$expenseId = $expensesResponse.data[0]._id
Write-Host "Using expense ID: $expenseId"

Write-Host ""
Write-Host "Step 2: Getting recipes..."
$recipesResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/recipes" -Method Get -Headers $headers
$recipe = $recipesResponse.data[0]
$recipeId = $recipe._id
Write-Host "Recipe to update: $($recipe.menuName_en) (ID: $recipeId)"

Write-Host ""
Write-Host "Step 3: Updating recipe with expense..."
$updateBody = @{
    menuId = $recipe.menuId._id
    baseMembers = $recipe.baseMembers
    ingredients = @(
        @{
            ingredientId = $recipe.ingredients[0].ingredientId._id
            ingredientName_en = $recipe.ingredients[0].ingredientName_en
            ingredientName_ta = $recipe.ingredients[0].ingredientName_ta
            quantity = $recipe.ingredients[0].quantity
            unit = $recipe.ingredients[0].unit
        }
    )
    expenses = @(
        @{
            expenseId = $expenseId
            amount = 50
        }
    )
    status = "active"
} | ConvertTo-Json -Depth 5

$updateResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/recipes/$recipeId" -Method Put -ContentType "application/json" -Body $updateBody -Headers $headers
Write-Host "Update successful"

Write-Host ""
Write-Host "Step 4: Fetching recipe to verify expenses..."
$fetchResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/recipes/$recipeId" -Method Get -Headers $headers
$updatedRecipe = $fetchResponse.data

Write-Host "Recipe: $($updatedRecipe.menuName_en)"
$expenseCount = if ($updatedRecipe.expenses) { $updatedRecipe.expenses.Count } else { 0 }
Write-Host "Expenses count: $expenseCount"

if ($expenseCount -gt 0) {
    Write-Host "SUCCESS - Expenses are saved correctly"
    foreach ($expense in $updatedRecipe.expenses) {
        Write-Host "  Amount: $($expense.amount)"
    }
} else {
    Write-Host "ERROR - Expenses field is empty"
}
