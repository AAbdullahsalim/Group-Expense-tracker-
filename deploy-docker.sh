#!/bin/bash

# Docker deployment script for Group Expense Tracker
set -e

echo "🚀 Starting Docker deployment for Group Expense Tracker..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your Supabase configuration."
    echo ""
    echo "Required environment variables:"
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key"
    exit 1
fi

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images (optional, comment out if you want to keep them)
echo "🗑️  Removing old images..."
docker system prune -f

# Build and start the containers
echo "🔨 Building and starting containers..."
docker-compose up --build -d

# Wait for the service to be ready
echo "⏳ Waiting for service to be ready..."
sleep 10

# Check if the service is healthy
echo "🔍 Checking service health..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Service is healthy and running!"
    echo "🌐 Your app is available at: http://localhost:3000"
else
    echo "❌ Service health check failed. Check the logs:"
    docker-compose logs
    exit 1
fi

echo ""
echo "🎉 Deployment complete!"
echo "📋 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop service: docker-compose down"
echo "  - Restart service: docker-compose restart" 