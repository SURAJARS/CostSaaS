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

$recipesResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/recipes" -Method Get -Headers $headers

Write-Host "Total recipes found: $($recipesResponse.pagination.total)"
Write-Host ""

foreach ($recipe in $recipesResponse.data) {
    Write-Host "Recipe: $($recipe.menuName_en)"
    Write-Host "  ID: $($recipe._id)"
    
    if ($recipe.expenses) {
        Write-Host "  Expenses count: $($recipe.expenses.Count)"
        foreach ($expense in $recipe.expenses) {
            Write-Host "    - ExpenseID: $($expense.expenseId), Amount: $($expense.amount)"
        }
    } else {
        Write-Host "  Expenses: EMPTY/NULL"
    }
    Write-Host ""
}
