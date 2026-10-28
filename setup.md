# Jay — Docker, environments, and agent playbook

**Product:** Jay  
**Repo path:** `/home/spotynet/projects/apps/jay`  
**Audience:** AI agents and humans making changes, reviews, or deploys.

Spotynet-wide pattern:  
[`/home/spotynet/projects/apps/docker-ecr-playbook.md`](../docker-ecr-playbook.md)

---

## Architecture (read this first)

```text
DEV (shared Spotynet EC2)
  Browser → host nginx :443
              → 127.0.0.1:3010   ← Jay gateway ONLY
                   project nginx (Compose)
                     ├─ jay-dev.spotynet.com     → mobile:3011
                     └─ jay-api-dev.spotynet.com → api:3012

PROD (dedicated EC2)
  Browser → host nginx :443 (Certbot)
              → host nginx :80
                   → 127.0.0.1:8080  (Compose project nginx)
                        → mobile / api
  App code runs from ECR images (not bind mounts)
  Setup TLS: sudo ./deploy/setup-prod-nginx.sh --certbot
```

| Rule | Jay detail |
|------|------------|
| One Compose stack | `compose.yaml` + `compose.prod.yaml` |
| Services | `api`, `mobile`, `nginx` — **one process per container** |
| App ports | `expose` only; nginx publishes the host port |
| Shared EC2 gateway | `127.0.0.1:3010` — never bind Jay nginx to host `:80` here |
| Prod gateway | Compose `127.0.0.1:8080`; host nginx + Certbot on `:80`/`:443` |
| Secrets | `backend/.env` (gitignored) — Django/DB |
| Registry config | `deploy.env` (gitignored) — `AWS_ACCOUNT_ID`, region, image tag |
| Images | ECR `apps/jay/{api,mobile}` |
| No GitHub Actions for images | `./build.sh` pushes to ECR |
| No supervisord mega-container | Removed; do not reintroduce |

Jay has **no** separate Next.js `web` service — Expo web is the frontend.

---

## Three commands

| Script | Machine | What it does |
|--------|---------|--------------|
| [`./dev.sh`](dev.sh) | Dev / shared EC2 | `compose.yaml` **build** + bind mounts + hot reload |
| [`./build.sh`](build.sh) | Builder (often shared EC2) | Build **prod** images → push ECR |
| [`./deploy.sh`](deploy.sh) | **Prod only** | Pull ECR → `up` → migrate |

```text
edit code  →  ./dev.sh
release    →  git checkout <default-branch> && ./build.sh
prod       →  JAY_IMAGE_TAG=<sha|main> ./deploy.sh
```

### Branch guard

`./build.sh` **refuses ECR push** unless the current git branch equals the repo default branch (`origin/HEAD`).  
Local-only: `PUSH=0 ./build.sh`. Emergency: `ALLOW_NON_DEFAULT_BRANCH=1`.

---

## Containers and Dockerfiles

| Service | Dev (`compose.yaml`) | Prod (`compose.prod.yaml`) | Dockerfile |
|---------|----------------------|----------------------------|------------|
| `api` | `runserver`, mount `./backend` | gunicorn, image from ECR, non-root | [`docker/api/Dockerfile`](docker/api/Dockerfile) |
| `mobile` | `expo start --web`, mount `./mobile` | `expo export` → nginx static | [`docker/mobile/Dockerfile`](docker/mobile/Dockerfile) |
| `nginx` | `127.0.0.1:3010:80` | `127.0.0.1:8080:80` | Official `nginx:1.27-alpine` + [`nginx/default.conf.template`](nginx/default.conf.template) |

Helpers:

- [`deploy/lib-ecr.sh`](deploy/lib-ecr.sh) — registry resolution + ECR login  
- [`deploy/aws-ecr.md`](deploy/aws-ecr.md) — IAM/ECR AWS setup  
- [`deploy/README.md`](deploy/README.md) — short ops checklist  
- [`deploy/setup-prod-nginx.sh`](deploy/setup-prod-nginx.sh) — host nginx → `:8080`

---

## Environment files

| File | Gitignored? | Purpose |
|------|-------------|---------|
| `backend/.env` | Yes | App secrets: `SECRET_KEY`, `DEBUG`, `DATABASE_URL`, … |
| `.env.example` | No | Template for `backend/.env` |
| `deploy.env` | Yes | `AWS_REGION`, `AWS_ACCOUNT_ID`, `JAY_IMAGE_TAG` — **no AWS access keys** |
| `deploy.env.example` | No | Template for `deploy.env` |
| Domains in `dev.sh` / `deploy.sh` | Committed | Hostnames for nginx |

**Do not** put ECR credentials in `backend/.env`. Auth is EC2 instance role + `aws ecr get-login-password`.

---

## Development setup (shared EC2)

### Prerequisites

- Docker Engine + Compose plugin
- User in the `docker` group (or use `sudo docker`)
- Outbound network to the database host

```bash
sudo usermod -aG docker "$USER"
# re-login or: newgrp docker
```

### First time

```bash
cd /home/spotynet/projects/apps/jay
cp .env.example backend/.env   # if needed; edit secrets
sudo ./deploy/bootstrap-shared.sh   # once: host nginx → :3010 + first up
# or: sudo ./deploy/apply-nginx.sh && ./dev.sh
```

### Day to day

```bash
./dev.sh
curl -sI -H 'Host: jay-dev.spotynet.com' http://127.0.0.1:3010/ | head -3
curl -sI -H 'Host: jay-api-dev.spotynet.com' http://127.0.0.1:3010/ | head -3
curl -sI https://jay-dev.spotynet.com/
curl -sI https://jay-api-dev.spotynet.com/
```

---

## Build + production

### ECR (once per account)

```bash
REGION=us-east-1
for name in api mobile; do
  aws ecr create-repository \
    --repository-name "apps/jay/${name}" \
    --region "$REGION" \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256
done
```

See [`deploy/aws-ecr.md`](deploy/aws-ecr.md) for IAM.

### Builder

```bash
cp deploy.env.example deploy.env   # set AWS_ACCOUNT_ID
git checkout <default-branch>
./build.sh
# Local-only test: PUSH=0 ./build.sh
```

### Prod machine

```bash
cp deploy.env.example deploy.env   # set AWS_ACCOUNT_ID
# backend/.env with DEBUG=False, DATABASE_URL, SECRET_KEY
sudo ./deploy/setup-prod-nginx.sh --certbot
JAY_IMAGE_TAG=<sha|main> ./deploy.sh
```

Do **not** run `./deploy.sh` on the shared Spotynet multi-app EC2.

---

## Key files

| Path | Role |
|------|------|
| `compose.yaml` | Dev: api + mobile + nginx on `127.0.0.1:3010` |
| `compose.prod.yaml` | Prod: ECR images, nginx on `127.0.0.1:8080` |
| `nginx/default.conf.template` | Host → `mobile` / `api` |
| `dev.sh` / `build.sh` / `deploy.sh` | Three-command workflow |
| `deploy/lib-ecr.sh` | ECR registry + login |
| `backend/.env` | Secrets / DB (gitignored) |

---

## Things to avoid

- Fat “all apps in one container” with supervisord  
- Building prod images on the prod host as the default path  
- Publishing images from feature branches without override  
- Binding project nginx to `:80` on the shared Spotynet host  
- Reintroducing PM2 as the primary runtime  
