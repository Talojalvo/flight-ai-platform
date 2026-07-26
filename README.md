# Flight AI Platform

A multi-agent AI platform for flight and travel planning.

## Architecture

- `frontend/` — React/Vite app (onboarding, results, and an Agent Management page at `/agents`).
- `backend/` — main FastAPI service. Hosts the `OrchestratorAgent`, the two internal recommendation
  agents (`FlightRecommendationAgent`, `HotelRecommendationAgent`), and the in-process `AgentRegistry`
  that tracks status/health/timing for all five agents (exposed via `GET /agents`).
- `services/flight-agent/` — standalone FastAPI microservice wrapping the Ignav integration
  (`POST /search`, `GET /health`).
- `services/hotel-agent/` — standalone FastAPI microservice wrapping the LiteAPI integration
  (`POST /search`, `GET /health`).

The main backend never talks to Ignav/LiteAPI directly — it calls `flight-agent`/`hotel-agent` over
HTTP (URLs from `FLIGHT_AGENT_URL`/`HOTEL_AGENT_URL` env vars), then runs the recommendation agents
over the results. All four services are independent, each with its own Dockerfile, `/health`
endpoint, and env-driven configuration, and ship the same way in every environment below:
`docker-compose.yml` locally, Kustomize manifests in `k8s/` on Kubernetes, and automatically via CI/CD
on every push to `main`.

## Technologies

- Python, FastAPI
- React, Vite
- LangChain
- Docker, Kubernetes (Kustomize), eksctl
- AWS (EKS, ECR, IAM/OIDC)
- GitHub Actions

## Running locally (Docker Compose)

```
docker compose up --build
```

Frontend at `http://localhost:5173`, backend at `http://localhost:8000`. Each service reads its own
`.env` file (`backend/.env`, `services/flight-agent/.env`, `services/hotel-agent/.env`) — see
`CLAUDE.md` for the required keys (`GOOGLE_API_KEY`, `IGNAV_API_KEY`, `LITEAPI_API_KEY`, etc.). These
files are git-ignored-by-convention; never commit real keys.

## Running on Kubernetes (Minikube)

```
minikube start --driver=docker
minikube addons enable ingress

eval $(minikube docker-env)   # point the Docker CLI at Minikube's daemon
docker build -t flight-agent:local ./services/flight-agent
docker build -t hotel-agent:local  ./services/hotel-agent
docker build -t backend:local      ./backend
docker build -t frontend:local --build-arg VITE_API_BASE_URL=http://flight-ai.local/api ./frontend

kubectl apply -f k8s/base/00-namespace.yaml
kubectl create secret generic flight-ai-secrets --namespace flight-ai-platform \
  --from-literal=GOOGLE_API_KEY=<key> \
  --from-literal=IGNAV_API_KEY=<key> \
  --from-literal=LITEAPI_API_KEY=<key>

kubectl apply -k k8s/overlays/minikube
```

Add `127.0.0.1 flight-ai.local` to your hosts file, then run `minikube tunnel` (or, if that doesn't
actually bind the port on your platform, `kubectl port-forward -n ingress-nginx
svc/ingress-nginx-controller 80:80`) and open `http://flight-ai.local`.

`k8s/base/02-secret.example.yaml` documents the required secret keys but is intentionally excluded
from the Kustomize build — the Secret is always created imperatively, per environment, so real keys
never touch the repo.

## Deploying to AWS (EKS)

Cluster infrastructure is defined in `infrastructure/eksctl-cluster.yaml` (eu-central-1, one managed
node group). Provision it with:

```
eksctl create cluster -f infrastructure/eksctl-cluster.yaml
eksctl utils associate-iam-oidc-provider --cluster flight-ai-platform --region eu-central-1 --approve
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.15.1/deploy/static/provider/aws/deploy.yaml
```

Notes baked into that config, worth knowing before changing it:

- **`t3.micro`, not `t3.medium`**: some AWS accounts have the Free Tier usage restriction enabled,
  which hard-blocks launching any non-free-tier instance type.
- **4 nodes, not 2**: `t3.micro`'s ENI/IP allocation caps it at 4 pods/node regardless of spare
  CPU/memory. `aws-node` + `kube-proxy` alone take 2 of those on every node, and coredns (x2) +
  ingress-nginx + the 4 app pods won't fit across just 2 nodes.

Images are pulled from ECR (`backend`, `flight-agent`, `hotel-agent`, and — note the existing typo —
`fronted`, not `frontend`). `k8s/overlays/aws/kustomization.yaml` rewrites the base manifests' image
refs to their ECR URIs and drops the `flight-ai.local` host restriction so the bare ingress-nginx NLB
hostname works without a custom domain. The `flight-ai-secrets` Secret is created the same way as on
Minikube, directly against the cluster, not through Kustomize.

## CI/CD

`.github/workflows/ci.yml` runs on every push/PR (lint, type-check, test, docker build validation).
On top of that, pushes to `main` that pass CI additionally run:

- **`push-images`** — builds and pushes all four images to ECR, tagged with the commit SHA (never
  `:latest`), so every deploy traces back to an exact commit and rollback is just redeploying the
  previous SHA.
- **`deploy`** — pins those SHA tags into `k8s/overlays/aws` via `kustomize edit set image`, then
  `kubectl apply -k` against the EKS cluster.

Both jobs authenticate to AWS via GitHub's OIDC provider assuming a narrowly-scoped IAM role
(`github-actions-flight-ai-platform`) — no long-lived AWS keys are stored in the repo. The role's
trust policy is pinned to this exact repo and branch via the `sub` claim
(`repo:<org>@<org_id>/<repo>@<repo_id>:ref:refs/heads/main` — GitHub embeds immutable org/repo IDs in
this claim, not just names), and its EKS access is scoped to the `flight-ai-platform` namespace only,
not cluster-admin.

Required one-time setup: a repository **variable** (not secret — an IAM role ARN isn't sensitive on
its own) named `AWS_DEPLOY_ROLE_ARN`, set to the role's ARN.