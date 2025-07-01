# PowerShell script to create .env file for Group Expense Tracker

Write-Host "🔧 Creating .env file for Group Expense Tracker" -ForegroundColor Green
Write-Host ""
Write-Host "You need to get these values from your Supabase project:" -ForegroundColor Yellow
Write-Host "1. Go to https://app.supabase.com/" -ForegroundColor Cyan
Write-Host "2. Select your project" -ForegroundColor Cyan
Write-Host "3. Go to Settings -> API" -ForegroundColor Cyan
Write-Host ""

# Get Supabase URL
$supabaseUrl = Read-Host "Enter your SUPABASE_URL (Project URL)"
if ([string]::IsNullOrWhiteSpace($supabaseUrl)) {
    Write-Host "❌ Supabase URL is required!" -ForegroundColor Red
    exit 1
}

# Get Supabase Anon Key
$supabaseAnonKey = Read-Host "Enter your SUPABASE_ANON_KEY (anon public key)"
if ([string]::IsNullOrWhiteSpace($supabaseAnonKey)) {
    Write-Host "❌ Supabase Anon Key is required!" -ForegroundColor Red
    exit 1
}

# Get Supabase Service Role Key
$supabaseServiceKey = Read-Host "Enter your SUPABASE_SERVICE_ROLE_KEY (service_role key)"
if ([string]::IsNullOrWhiteSpace($supabaseServiceKey)) {
    Write-Host "❌ Supabase Service Role Key is required!" -ForegroundColor Red
    exit 1
}

# Create .env file content
$envContent = @"
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnonKey
SUPABASE_SERVICE_ROLE_KEY=$supabaseServiceKey
"@

# Write to .env file
try {
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host ""
    Write-Host "✅ .env file created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Created .env file with:" -ForegroundColor Yellow
    Write-Host "  - NEXT_PUBLIC_SUPABASE_URL: $supabaseUrl"
    Write-Host "  - NEXT_PUBLIC_SUPABASE_ANON_KEY: $($supabaseAnonKey.Substring(0, 10))..."
    Write-Host "  - SUPABASE_SERVICE_ROLE_KEY: $($supabaseServiceKey.Substring(0, 10))..."
    Write-Host ""
    Write-Host "🚀 You can now run: .\deploy-docker.ps1" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to create .env file: $_" -ForegroundColor Red
    exit 1
} 