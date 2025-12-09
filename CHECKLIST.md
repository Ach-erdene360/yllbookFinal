# YellowBooks EKS Deployment Checklist

## Pre-Deployment Checklist

### AWS Setup
- [ ] AWS CLI installed and configured
- [ ] kubectl installed (v1.28+)
- [ ] eksctl installed
- [ ] Helm installed (for ALB controller)

### OIDC & IAM (20 pts)
- [ ] OIDC provider created in AWS IAM
- [ ] IAM role `github.to.aws.oicd` created with trust policy
- [ ] ECR policy attached to role
- [ ] EKS policy attached to role
- [ ] Custom deploy policy created and attached

### EKS Cluster (10 pts)
- [ ] EKS cluster `yellowbook-cluster` created in us-east-1
- [ ] Node group with 2-4 t3.medium instances
- [ ] aws-auth ConfigMap updated with GitHub Actions role
- [ ] AWS Load Balancer Controller installed
- [ ] Metrics Server installed for HPA

### Database
- [ ] RDS PostgreSQL instance created
- [ ] Database accessible from EKS (security groups configured)
- [ ] Database URL noted for secrets

### Domain & Certificate (20 pts)
- [ ] Domain name ready in Route53
- [ ] ACM certificate requested for domain
- [ ] Certificate validated (DNS validation)
- [ ] Certificate ARN noted

### Configuration Files (25 pts)
- [ ] Updated `k8s/ingress.yaml` with certificate ARN
- [ ] Updated `k8s/ingress.yaml` with actual domain name
- [ ] Updated `k8s/frontend-deployment.yaml` with domain in NEXT_PUBLIC_API_URL
- [ ] Updated `apps/api/src/main.ts` CORS origins with actual domain

## Deployment Steps

### 1. Create Kubernetes Secret
```bash
kubectl create namespace yellowbooks
kubectl create secret generic yellowbooks-secrets \
  --from-literal=database-url="postgresql://USER:PASS@ENDPOINT:5432/yellowbooks" \
  -n yellowbooks
```
- [ ] Namespace created
- [ ] Secret created with correct DATABASE_URL

### 2. Deploy via GitHub Actions
```bash
git add .
git commit -m "Deploy to EKS"
git push origin main
```
- [ ] Code pushed to GitHub
- [ ] GitHub Actions workflow triggered
- [ ] Build jobs succeeded (check Actions tab)
- [ ] Deploy job succeeded

### 3. Verify Deployment (10 pts - Migration Job)
```bash
kubectl get pods -n yellowbooks
```
- [ ] Migration job completed successfully
- [ ] Backend pods running (2/2 ready)
- [ ] Frontend pods running (2/2 ready)

### 4. Check Services
```bash
kubectl get svc -n yellowbooks
```
- [ ] backend-service created
- [ ] frontend-service created

### 5. Check HPA (10 pts)
```bash
kubectl get hpa -n yellowbooks
```
- [ ] backend-hpa active (min 2, max 10)
- [ ] frontend-hpa active (min 2, max 10)

### 6. Check Ingress & ALB
```bash
kubectl get ingress -n yellowbooks
kubectl describe ingress yellowbooks-ingress -n yellowbooks
```
- [ ] Ingress created
- [ ] ALB provisioned (check AWS EC2 console)
- [ ] ALB DNS name visible
- [ ] Target groups healthy

### 7. Configure Route53
- [ ] CNAME record created: `yellowbooks.yourdomain.com` → ALB DNS
- [ ] DNS propagated (test with `nslookup`)

### 8. Test Application
- [ ] Visit `https://yellowbooks.yourdomain.com`
- [ ] HTTPS working (padlock visible) ✅
- [ ] Frontend loads successfully
- [ ] API accessible at `/api`
- [ ] tRPC working at `/trpc`

## Verification Screenshots Needed

- [ ] Screenshot: Browser with HTTPS padlock on your domain
- [ ] Screenshot: `kubectl get pods -n yellowbooks` showing Ready status
- [ ] Screenshot: GitHub Actions successful workflow run
- [ ] Document: Link to successful GitHub Actions run

## Documentation (5 pts)
- [ ] DEPLOY.md completed with all steps
- [ ] OIDC setup documented
- [ ] EKS cluster setup documented
- [ ] Manifest files explained
- [ ] Ingress/TLS setup documented
- [ ] Troubleshooting section included

## Grading Rubric Checklist (100 pts total)

- [ ] OIDC/Roles (20 pts) - IAM role with OIDC trust, proper policies
- [ ] aws-auth/RBAC (10 pts) - ConfigMap updated, role has cluster access
- [ ] Manifests (25 pts) - All 6 manifests complete and working
- [ ] Ingress/TLS (20 pts) - ALB with ACM certificate, HTTPS working
- [ ] Migration Job (10 pts) - Prisma migration runs successfully
- [ ] HPA (10 pts) - Autoscaling configured and active
- [ ] Docs (5 pts) - Comprehensive DEPLOY.md

## Common Issues & Fixes

### Pods CrashLoopBackOff
```bash
kubectl logs <pod-name> -n yellowbooks
kubectl describe pod <pod-name> -n yellowbooks
```
- Check DATABASE_URL secret
- Check image build succeeded
- Check application logs

### Ingress Not Creating ALB
```bash
kubectl logs -n kube-system deployment/aws-load-balancer-controller
```
- Verify ALB controller installed
- Check IAM permissions
- Check certificate ARN is correct

### Cannot Access via Domain
- Check Route53 CNAME record
- Check ALB security groups allow 80/443
- Check certificate is validated in ACM
- Check target groups are healthy

### Database Connection Failed
- Check security groups allow PostgreSQL (5432)
- Verify DATABASE_URL format
- Test connection from pod: `kubectl exec -it <pod> -n yellowbooks -- sh`

## Final Verification

Before submitting:
- [ ] Application accessible via HTTPS with padlock
- [ ] All pods in Ready state
- [ ] HPA showing correct metrics
- [ ] GitHub Actions workflow succeeded
- [ ] Screenshots taken
- [ ] DEPLOY.md complete
- [ ] Code committed and pushed

## Submission Items
1. Public HTTPS URL: https://yellowbooks.yourdomain.com
2. Screenshot: Browser with padlock visible
3. Screenshot: `kubectl get pods -n yellowbooks` output
4. GitHub Actions run link: https://github.com/Ach-erdene360/yllbookFinal/actions/runs/XXXXX
5. DEPLOY.md with complete documentation

---

**Ready to deploy? Start from the top and check off each item!** 🚀
