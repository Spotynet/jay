# Jay: develop / build / deploy

## Workflow

| When | Where | Command |
|------|--------|---------|
| First time on shared EC2 | Dev host | Install Docker; `sudo ./deploy/bootstrap-shared.sh` (once) |
| Day-to-day / refresh | Dev host | `./dev.sh` |
| Release images | Builder (often shared EC2) | `./build.sh` (default branch only for push) |
| First time on prod | Prod host | `backend/.env` + `deploy.env` + `sudo ./deploy/setup-prod-nginx.sh --certbot` |
| After image push | Prod host | `JAY_IMAGE_TAG=<sha\|main> ./deploy.sh` |

**Domains** live in the scripts (committed):

- `dev.sh` → `jay-dev.spotynet.com` / `jay-api-dev.spotynet.com`
- `deploy.sh` → `jay.spotynet.com` / `jay-api.spotynet.com` (or CLI args)

**Secrets** stay in gitignored `backend/.env`.  
**Registry config** stays in gitignored `deploy.env` (see `deploy.env.example`) — no AWS access keys.

## Commands

```bash
./dev.sh                                    # development (compose build + mounts)
./build.sh                                  # build + push ECR (default branch)
PUSH=0 ./build.sh                           # local build/tag only
./deploy.sh                                 # prod: pull ECR + up + migrate
./deploy.sh jay.example.com jay-api.example.com
./deploy.sh down                            # stop production
```

## Shared EC2 (dev) — once

```bash
sudo ./deploy/bootstrap-shared.sh
./dev.sh
```

## Dedicated production — once, then deploy

1. Create ECR repos + IAM (see [`aws-ecr.md`](aws-ecr.md)).
2. `cp deploy.env.example deploy.env` and set `AWS_ACCOUNT_ID`.
3. Create `backend/.env` with `SECRET_KEY`, `DATABASE_URL`, `DEBUG=False`, etc.
4. DNS → machine IP; `sudo ./deploy/setup-prod-nginx.sh --certbot`.
5. On builder: `./build.sh`. On prod: `./deploy.sh`.

Do **not** run `./deploy.sh` on the shared Spotynet multi-app EC2.
