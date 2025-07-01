# Docker deployment script for Group Expense Tracker (PowerShell)

Write-Host "🚀 Starting Docker deployment for Group Expense Tracker..." -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with your Supabase configuration." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Required environment variables:" -ForegroundColor Yellow
    Write-Host "NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url"
    Write-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    Write-Host "SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key"
    exit 1
}

# Stop and remove existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Remove old images (optional)
Write-Host "🗑️  Removing old images..." -ForegroundColor Yellow
docker system prune -f

# Build and start the containers
Write-Host "🔨 Building and starting containers..." -ForegroundColor Blue
docker-compose up --build -d

# Wait for the service to be ready
Write-Host "⏳ Waiting for service to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if the service is healthy
Write-Host "🔍 Checking service health..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Service is healthy and running!" -ForegroundColor Green
        Write-Host "🌐 Your app is available at: http://localhost:3000" -ForegroundColor Cyan
    } else {
        throw "Health check failed"
    }
} catch {
    Write-Host "❌ Service health check failed. Check the logs:" -ForegroundColor Red
    docker-compose logs
    exit 1
}

Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host "📋 Useful commands:" -ForegroundColor Yellow
Write-Host "  - View logs: docker-compose logs -f"
Write-Host "  - Stop service: docker-compose down"
Write-Host "  - Restart service: docker-compose restart"