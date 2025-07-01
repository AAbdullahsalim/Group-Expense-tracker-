# Docker Deployment Guide

This guide will help you deploy your Group Expense Tracker application using Docker.

## Prerequisites

Before starting, make sure you have the following installed:

1. **Docker Desktop**: Download from [docker.com](https://www.docker.com/products/docker-desktop/)
2. **Docker Compose**: Usually included with Docker Desktop
3. **Supabase Account**: Sign up at [supabase.com](https://supabase.com/)

## Step 1: Setup Environment Variables

Create a `.env` file in the root directory of your project with your Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### How to get Supabase credentials:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API keys** → `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

## Step 2: Deploy with Docker

### Option A: Using the Automated Script (Recommended)

#### On Windows (PowerShell):
```powershell
.\deploy-docker.ps1
```

#### On Linux/Mac (Bash):
```bash
./deploy-docker.sh
```

### Option B: Manual Deployment

1. **Build the Docker image:**
   ```bash
   docker-compose build
   ```

2. **Start the container:**
   ```bash
   docker-compose up -d
   ```

3. **Check if it's running:**
   ```bash
   docker-compose ps
   ```

## Step 3: Verify Deployment

1. **Check health status:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Docker Commands Reference

### Basic Commands:
- **Start services:** `docker-compose up -d`
- **Stop services:** `docker-compose down`
- **View logs:** `docker-compose logs -f`
- **Restart services:** `docker-compose restart`
- **Rebuild and start:** `docker-compose up --build -d`

### Maintenance Commands:
- **View running containers:** `docker-compose ps`
- **Execute command in container:** `docker-compose exec group-expense-tracker sh`
- **Remove all containers and images:** `docker-compose down --rmi all`

## Troubleshooting

### Common Issues:

1. **Port 3000 already in use:**
   ```bash
   # Change the port in docker-compose.yml
   ports:
     - "3001:3000"  # Use port 3001 instead
   ```

2. **Environment variables not working:**
   - Ensure `.env` file exists in the root directory
   - Check that there are no spaces around the `=` sign
   - Restart the container after changing environment variables

3. **Build failures:**
   ```bash
   # Clean Docker cache and rebuild
   docker system prune -a
   docker-compose build --no-cache
   ```

4. **Health check failing:**
   ```bash
   # Check container logs
   docker-compose logs group-expense-tracker
   ```

### Getting Help:

- **View container logs:** `docker-compose logs group-expense-tracker`
- **Access container shell:** `docker-compose exec group-expense-tracker sh`
- **Check Docker status:** `docker-compose ps`

## Production Deployment

For production deployment, consider:

1. **Use a reverse proxy** (Nginx, Traefik)
2. **Enable HTTPS** with SSL certificates
3. **Set up monitoring** and logging
4. **Configure environment-specific variables**
5. **Set up backup strategies** for your database

### Example production docker-compose.yml:

```yaml
version: '3.8'

services:
  group-expense-tracker:
    image: your-registry/group-expense-tracker:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique passwords for production
- Regularly update your Docker images
- Monitor your application logs for suspicious activity

---

🎉 **Congratulations!** Your Group Expense Tracker is now running in Docker! 