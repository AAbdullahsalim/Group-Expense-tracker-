# Group Expense Tracker API Test Script
# This script helps you quickly test your API endpoints

$baseUrl = "http://localhost:3000"

Write-Host "🚀 Testing Group Expense Tracker API" -ForegroundColor Green
Write-Host "Base URL: $baseUrl" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1️⃣ Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/health" -Method GET
    $content = $response.Content | ConvertFrom-Json
    Write-Host "✅ Health Check: $($content.status)" -ForegroundColor Green
    Write-Host "   Timestamp: $($content.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Instructions for authenticated endpoints
Write-Host "🔐 For testing authenticated endpoints:" -ForegroundColor Yellow
Write-Host "1. Open your browser and go to $baseUrl" -ForegroundColor Cyan
Write-Host "2. Sign in to your account" -ForegroundColor Cyan
Write-Host "3. Use browser Developer Tools (F12) to:" -ForegroundColor Cyan
Write-Host "   - Go to Application/Storage tab" -ForegroundColor Gray
Write-Host "   - Find Cookies for localhost:3000" -ForegroundColor Gray
Write-Host "   - Copy the session cookie values" -ForegroundColor Gray
Write-Host "4. Use those cookies in Postman for authentication" -ForegroundColor Cyan

Write-Host ""

# Test groups endpoint (will need authentication)
Write-Host "2️⃣ Testing Groups Endpoint (requires auth)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/groups" -Method GET
    Write-Host "✅ Groups endpoint accessible" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "🔒 Groups endpoint requires authentication (expected)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Groups endpoint error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Import the Postman collection: Group_Expense_Tracker_API.postman_collection.json" -ForegroundColor Cyan
Write-Host "2. Read the API documentation: API_DOCUMENTATION.md" -ForegroundColor Cyan
Write-Host "3. Sign in through the web app first to get session cookies" -ForegroundColor Cyan
Write-Host "4. Test endpoints in Postman using the session cookies" -ForegroundColor Cyan 