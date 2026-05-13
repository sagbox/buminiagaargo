#!/bin/bash
# ============================================================
# Bumi Niaga Agrochem — Production Deploy Script (Docker Compose)
# Builds all services and deploys with docker compose
# Usage: ./deploy-compose.sh
# ============================================================
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

if [ ! -f .env ]; then
  echo "ERROR: .env file not found!"
  echo "Run: cp .env.production.example .env"
  echo "Then fill in your production values."
  exit 1
fi

echo "========================================="
echo " Bumi Niaga Agrochem — Production Deploy"
echo "========================================="
echo ""

echo "=== [1/4] Building backend JARs ==="
cd "$PROJECT_ROOT/backend"
for svc in api-gateway user-service product-service order-service payment-service; do
  echo "  Building $svc..."
  cd "$PROJECT_ROOT/backend/$svc"
  mvn clean package -DskipTests -q
  echo "  ✓ $svc built"
done

echo ""
echo "=== [2/4] Building frontend ==="
cd "$PROJECT_ROOT/frontend"
npm ci --silent
npm run build
echo "  ✓ Frontend built to dist/"

echo ""
echo "=== [3/4] Building Docker images ==="
cd "$PROJECT_ROOT"
docker compose -f docker-compose.prod.yml build

echo ""
echo "=== [4/4] Starting services ==="
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "========================================="
echo " Deploy complete!"
echo "========================================="
echo ""
echo "Services starting up (JVM takes ~60s)..."
echo ""
echo "Useful commands:"
echo "  docker compose -f docker-compose.prod.yml ps       # service status"
echo "  docker compose -f docker-compose.prod.yml logs -f  # all logs"
echo "  docker stats --no-stream                           # memory usage"
echo ""

PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_EC2_IP")
echo "Site: http://$PUBLIC_IP"
echo ""
