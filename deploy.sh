# YellowBooks Quick Deployment Script
# Run these commands in order

# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Create database secret (REPLACE WITH YOUR ACTUAL DATABASE URL)
kubectl create secret generic yellowbooks-secrets \
  --from-literal=database-url="postgresql://username:password@your-rds-endpoint:5432/yellowbooks" \
  -n yellowbooks

# 3. Apply all manifests
kubectl apply -f k8s/migration-job.yaml
kubectl wait --for=condition=complete --timeout=300s job/prisma-migration -n yellowbooks

kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/services.yaml  
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml

# 4. Check status
kubectl get pods -n yellowbooks
kubectl get svc -n yellowbooks
kubectl get ingress -n yellowbooks

# 5. Get ALB DNS name for Route53
kubectl get ingress yellowbooks-ingress -n yellowbooks -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

echo "\nCreate a CNAME record in Route53 pointing to the ALB DNS name above"
