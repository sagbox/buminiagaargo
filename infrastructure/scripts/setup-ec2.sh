#!/bin/bash
# ============================================================
# Bumi Niaga Agrochem — EC2 Bootstrap Script
# Run once on a fresh Ubuntu 22.04 EC2 instance
# Usage: bash setup-ec2.sh
# ============================================================
set -e

echo "=== [1/6] Update system packages ==="
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip jq

echo "=== [2/6] Install Docker ==="
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
echo "Docker installed: $(docker --version)"

echo "=== [3/6] Install k3s (lightweight Kubernetes) ==="
# Disable built-in Traefik (we install our own for more control)
curl -sfL https://get.k3s.io | sh -s - \
  --disable traefik \
  --write-kubeconfig-mode 644

# Export kubeconfig for current user
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown ubuntu:ubuntu ~/.kube/config
export KUBECONFIG=~/.kube/config
echo "k3s installed: $(kubectl version --short 2>/dev/null | head -1)"

echo "=== [4/6] Install Helm ==="
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
echo "Helm installed: $(helm version --short)"

echo "=== [5/6] Install Traefik (Ingress Controller) ==="
helm repo add traefik https://traefik.github.io/charts
helm repo update
helm install traefik traefik/traefik \
  --namespace kube-system \
  --set ports.web.port=80 \
  --set ports.web.expose.default=true \
  --set ports.websecure.port=443 \
  --set ports.websecure.expose.default=true \
  --set service.type=LoadBalancer

echo "=== [6/6] Install cert-manager (Let's Encrypt TLS) ==="
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.5/cert-manager.yaml
echo "Waiting for cert-manager to be ready..."
kubectl wait --namespace cert-manager \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

echo ""
echo "=== Setup Complete! ==="
echo "Next steps:"
echo "1. Copy your .env values and create k8s secrets:"
echo "   kubectl create namespace buminiaga"
echo "   kubectl create secret generic app-secrets --from-env-file=.env -n buminiaga"
echo "2. Apply k8s manifests: kubectl apply -f infrastructure/k8s/ -n buminiaga"
echo "3. Setup DNS: Point api.buminiagaagrochem.id -> $(curl -s ifconfig.me)"
