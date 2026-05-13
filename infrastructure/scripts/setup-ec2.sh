#!/bin/bash
# ============================================================
# Bumi Niaga Agrochem — EC2 Bootstrap Script (Docker Compose)
# Run once on a fresh Ubuntu 22.04 EC2 instance
# Usage: bash setup-ec2.sh
# ============================================================
set -e

echo "=== [1/5] Update system packages ==="
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip jq

echo "=== [2/5] Install Docker ==="
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
echo "Docker installed: $(docker --version)"

echo "=== [3/5] Install Docker Compose v2 ==="
sudo apt install -y docker-compose-plugin
echo "Docker Compose: $(docker compose version)"

echo "=== [4/5] Install Java 21 + Maven ==="
sudo apt install -y openjdk-21-jdk maven
echo "Java: $(java --version 2>&1 | head -1)"
echo "Maven: $(mvn --version 2>&1 | head -1)"

echo "=== [5/5] Install Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
echo "Node: $(node --version)"
echo "npm: $(npm --version)"

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "IMPORTANT: Log out and log back in for Docker group to take effect."
echo ""
echo "Next steps:"
echo "  1. git clone <your-repo> buminiagaargo && cd buminiagaargo"
echo "  2. cp .env.production.example .env"
echo "  3. nano .env  # fill in RDS endpoint, JWT secret, AWS keys, etc."
echo "  4. chmod +x infrastructure/scripts/deploy-compose.sh"
echo "  5. ./infrastructure/scripts/deploy-compose.sh"
echo ""
echo "Your public IP: $(curl -s ifconfig.me 2>/dev/null || echo '<check AWS console>')"
