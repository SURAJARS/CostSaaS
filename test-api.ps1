# Login
$loginBody = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

Write-Host "Attempting login..."
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody

$token = $loginResponse.data.token
Write-Host "✓ Login successful"
Write-Host "Token: $token`n"

# Get recipes
Write-Host "Getting all recipes..."
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$recipesResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/recipes" -Method Get -Headers $headers
Write-Host "✓ Retrieved recipes"
Write-Host "Total recipes: $($recipesResponse.pagination.total)`n"

# Display first recipe with expenses
if ($recipesResponse.data.Count -gt 0) {
    $firstRecipe = $recipesResponse.data[0]
    Write-Host "First Recipe:"
    Write-Host "ID: $($firstRecipe._id)"
    Write-Host "Menu: $($firstRecipe.menuName_en)"
    Write-Host "Base Members: $($firstRecipe.baseMembers)"
    Write-Host "Ingredients Count: $($firstRecipe.ingredients.Count)"
    Write-Host "Expenses: $(if ($firstRecipe.expenses) { $firstRecipe.expenses.Count } else { 0 })"
    Write-Host ""
    Write-Host "Expenses data:"
    $firstRecipe.expenses | ConvertTo-Json
}
