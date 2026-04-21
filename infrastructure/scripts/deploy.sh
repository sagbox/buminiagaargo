#!/bin/bash
# ============================================================
# Bumi Niaga Agrochem — Deploy Script
# Usage: ./deploy.sh <service-name> [version]
# Example: ./deploy.sh user-service v1.0.1
# ============================================================
set -e

SERVICE=$1
VERSION=${2:-latest}

if [ -z "$SERVICE" ]; then
  echo "Usage: $0 <service-name> [version]"
  echo "Services: api-gateway user-service product-service order-service payment-service"
  exit 1
fi

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

ECR_ACCOUNT=${AWS_ACCOUNT_ID:?Set AWS_ACCOUNT_ID in .env}
ECR_REGION=${AWS_REGION:-ap-southeast-1}
ECR_REPO="$ECR_ACCOUNT.dkr.ecr.$ECR_REGION.amazonaws.com/buminiaga"

echo "=== Building $SERVICE:$VERSION ==="
cd backend/$SERVICE

# Build the JAR
mvn clean package -DskipTests -q
echo "✓ JAR built"

# Build Docker image
docker build -t $ECR_REPO/$SERVICE:$VERSION .
docker tag $ECR_REPO/$SERVICE:$VERSION $ECR_REPO/$SERVICE:latest
echo "✓ Docker image built"

echo "=== Pushing to ECR ==="
aws ecr get-login-password --region $ECR_REGION | \
  docker login --username AWS --password-stdin $ECR_ACCOUNT.dkr.ecr.$ECR_REGION.amazonaws.com

docker push $ECR_REPO/$SERVICE:$VERSION
docker push $ECR_REPO/$SERVICE:latest
echo "✓ Pushed to ECR"

echo "=== Deploying to k3s ==="
kubectl set image deployment/$SERVICE \
  $SERVICE=$ECR_REPO/$SERVICE:$VERSION \
  -n buminiaga

kubectl rollout status deployment/$SERVICE -n buminiaga --timeout=120s
echo "✓ $SERVICE deployed successfully!"
