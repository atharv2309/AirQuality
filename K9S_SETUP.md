# K9s Setup for Air Quality Forecasting App

This guide will help you set up k9s to monitor and manage your Air Quality Forecasting application running on Kubernetes.

## Prerequisites

1. **Docker** - For building container images
2. **kubectl** - Kubernetes command-line tool
3. **k9s** - Kubernetes CLI for monitoring clusters
4. **A Kubernetes cluster** (minikube, kind, or cloud provider)

## Installation

### Install k9s

**macOS (via Homebrew):**
```bash
brew install k9s
```

**Linux:**
```bash
# Download latest release
curl -sL https://github.com/derailed/k9s/releases/latest/download/k9s_Linux_amd64.tar.gz | tar xfz - -C /tmp
sudo mv /tmp/k9s /usr/local/bin
```

**Windows (via Chocolatey):**
```bash
choco install k9s
```

## Quick Start

### 1. Build Docker Images

```bash
# Build API image
docker build -t aqi-api:latest ./api

# Build Web image
docker build -t aqi-web:latest ./web
```

### 2. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy services
kubectl apply -f k8s/ -n aqi-app
```

### 3. Launch k9s

```bash
# Launch k9s in the aqi-app namespace
k9s -n aqi-app
```

## K9s Navigation

### Basic Commands:
- `:q` - Quit k9s
- `:ns` - Switch namespaces
- `:pod` - View pods
- `:svc` - View services
- `:deploy` - View deployments
- `:ing` - View ingresses

### Pod Management:
- `Enter` - View pod details
- `l` - View logs
- `d` - Describe resource
- `e` - Edit resource
- `y` - View YAML
- `Ctrl+d` - Delete resource
- `s` - Shell into pod

### Monitoring:
- `0` - Show all namespaces
- `1-9` - Set refresh rate
- `?` - Help menu

## Useful K9s Views for This Project

### 1. Monitor Deployments
```
:deploy
```
Check if both `aqi-api` and `aqi-web` deployments are ready.

### 2. Check Pod Health
```
:pod
```
Monitor pod status, restarts, and resource usage.

### 3. View Service Endpoints
```
:svc
```
Ensure services are correctly exposing ports.

### 4. Check Ingress Rules
```
:ing
```
Verify ingress configuration for routing.

### 5. Monitor Events
```
:events
```
Watch cluster events for troubleshooting.

## Troubleshooting with k9s

### Common Issues:

1. **Pods not starting:**
   - Navigate to `:pod`
   - Select failing pod and press `d` to describe
   - Press `l` to view logs

2. **Service connectivity:**
   - Check `:svc` for correct port mappings
   - Use `:ep` to view endpoints

3. **Image pull errors:**
   - Ensure images are built locally or pushed to registry
   - Check pod events with `:events`

## Custom k9s Configuration

Create `~/.k9s/config.yml`:

```yaml
k9s:
  refreshRate: 2
  maxConnRetry: 5
  readOnly: false
  noExitOnCtrlC: false
  ui:
    enableMouse: false
    headless: false
    logoless: false
    crumbsless: false
    reactive: false
    noIcons: false
  skipLatestRevCheck: false
  disablePodCounting: false
  shellPod:
    image: busybox:1.35.0
    namespace: default
    limits:
      cpu: 100m
      memory: 100Mi
  imageScans:
    enable: false
  logger:
    tail: 100
    buffer: 5000
    sinceSeconds: -1
    fullScreenLogs: false
    textWrap: false
    showTime: false
  thresholds:
    cpu:
      critical: 90
      warn: 70
    memory:
      critical: 90
      warn: 70
```

## Development Workflow

### Local Development with Docker Compose
```bash
# Start services locally
docker-compose up --build

# Scale services
docker-compose up --scale aqi-web=3
```

### Deploy to Kubernetes
```bash
# Apply all manifests
kubectl apply -f k8s/ -n aqi-app

# Watch deployment
k9s -n aqi-app
```

### Update Application
```bash
# Rebuild and push images
docker build -t aqi-api:v2 ./api
docker build -t aqi-web:v2 ./web

# Update deployments
kubectl set image deployment/aqi-api aqi-api=aqi-api:v2 -n aqi-app
kubectl set image deployment/aqi-web aqi-web=aqi-web:v2 -n aqi-app

# Monitor rollout in k9s
k9s -n aqi-app
```

## Monitoring Dashboard

### Key Metrics to Watch:
1. **Pod Status** - All pods should be Running
2. **Resource Usage** - CPU and memory within limits
3. **Restart Count** - Should remain low
4. **Ready Status** - All replicas should be ready
5. **Events** - No error events

### Performance Monitoring:
- Use `:top pod` to see resource usage
- Use `:pf` for port forwarding to services
- Monitor logs with `l` on selected pods

## Next Steps

1. Set up monitoring with Prometheus and Grafana
2. Configure horizontal pod autoscaling
3. Set up persistent storage for any data needs
4. Implement CI/CD pipeline for automatic deployments

## Useful Commands

```bash
# Port forward to local machine
kubectl port-forward svc/aqi-web-service 3000:3000 -n aqi-app

# Get all resources in namespace
kubectl get all -n aqi-app

# Watch pod status
kubectl get pods -w -n aqi-app

# Check cluster info
kubectl cluster-info
```