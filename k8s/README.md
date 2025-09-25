# Kubernetes Manifests

This directory contains Kubernetes manifests for deploying the Air Quality Forecasting application.

## Files

- `namespace.yaml` - Creates the `aqi-app` namespace
- `api-deployment.yaml` - Deployment and service for the FastAPI backend
- `web-deployment.yaml` - Deployment and service for the Next.js frontend
- `ingress.yaml` - Ingress configuration for routing

## Quick Deploy

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check status
kubectl get all -n aqi-app
```

## Use with k9s

```bash
# Launch k9s in the application namespace
k9s -n aqi-app
```

See `../K9S_SETUP.md` for detailed k9s configuration and usage instructions.