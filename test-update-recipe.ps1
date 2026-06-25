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
Write-Host "Total expenses: $($expensesResponse.pagination.total)"

if ($expensesResponse.data.Count -eq 0) {
    Write-Host "No expenses found. Creating an expense first..."
    $expenseBody = @{
        name_en = "Gas Charge"
        description = "Cooking gas expense"
    } | ConvertTo-Json
    
    $expenseResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/expenses" -Method Post -ContentType "application/json" -Body $expenseBody -Headers $headers
    $expenseId = $expenseResponse.data._id
    Write-Host "Created expense ID: $expenseId"
} else {
    $expenseId = $expensesResponse.data[0]._id
    Write-Host "Using existing expense ID: $expenseId"
}

Write-Host ""
Write-Host "Step 2: Getting recipe to update..."
$recipesResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/recipes" -Method Get -Headers $headers
$recipeId = $recipesResponse.data[0]._id
Write-Host "Recipe ID to update: $recipeId"
Write-Host "Recipe Name: $($recipesResponse.data[0].menuName_en)"

Write-Host ""
Write-Host "Step 3: Updating recipe with expense..."
$updateBody = @{
    menuId = $recipesResponse.data[0].menuId._id
    baseMembers = $recipesResponse.data[0].baseMembers
    ingredients = $recipesResponse.data[0].ingredients
    expenses = @(
        @{
            expenseId = $expenseId
            amount = 50
        }
    )
    status = "active"
} | ConvertTo-Json -Depth 5

Write-Host "Update payload:"
$updateBody | Write-Host

$updateResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/recipes/$recipeId" -Method Put -ContentType "application/json" -Body $updateBody -Headers $headers
Write-Host "Update successful!"
Write-Host ""

Write-Host "Step 4: Fetching recipe to verify expenses are saved..."
$fetchResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/recipes/$recipeId" -Method Get -Headers $headers
$recipe = $fetchResponse.data

Write-Host "Recipe: $($recipe.menuName_en)"
Write-Host "Expenses count: $(if ($recipe.expenses) { $recipe.expenses.Count } else { 0 })"

if ($recipe.expenses) {
    Write-Host "Expenses data:"
    foreach ($expense in $recipe.expenses) {
        Write-Host "  - ExpenseID: $($expense.expenseId)"
        Write-Host "    Amount: $($expense.amount)"
    }
} else {
    Write-Host "ERROR: Expenses field is empty or null after update!"
}
