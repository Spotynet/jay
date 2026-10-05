# Jay — Setup & Use Guide

Step-by-step guide to stand up **development** (shared EC2) and **production** (dedicated machine) instances, plus day-to-day commands and architecture.

---

## Architecture overview

Jay runs as three Compose services: **api** (Django), **mobile** (Expo web), and **nginx** (project reverse proxy). Upstream names are Compose DNS (`api`, `mobile`) — never host IPs.

### Development (shared Spotynet EC2)

```text
Browser
  → Host nginx :443 (TLS + IP allowlist)
       → 127.0.0.1:3010   (project nginx only published port)
            ├─ jay-dev.spotynet.com      → mobile:3011
            └─ jay-api-dev.spotynet.com  → api:3012
                 → AWS RDS (jay_db)
```

- Host nginx config: `/etc/nginx/sites-available/spotynet-dev.conf`
- Shared IP allowlist: `/etc/nginx/snippets/dev-ip-allow.conf`
- Project nginx binds **only** `127.0.0.1:3010` (not public)

### Production (dedicated machine)

```text
Browser
  → [optional TLS: Certbot / load balancer]
  → Project nginx :80
       ├─ JAY_WEB_HOST  → mobile:3011
       └─ JAY_API_HOST  → api:3012
            → DATABASE_URL (RDS or other)
```

- No host `spotynet-dev.conf` required
- Project nginx publishes host **`:80`** via `compose.prod.yaml`

### What is committed vs local

| Item | Location | In git? |
|------|----------|---------|
| Domains (dev) | Top of `dev.sh` | Yes |
| Domains (prod) | Top of `deploy.sh` (or CLI args) | Yes |
| Nginx routing template | `nginx/default.conf.template` | Yes |
| Compose files | `compose.yaml`, `compose.prod.yaml` | Yes |
| Secrets / DB URL | `backend/.env` | **No** (gitignored) |
| Optional mobile env | `mobile/.env` | **No** |

`./dev.sh` and `./deploy.sh` export `JAY_WEB_HOST`, `JAY_API_HOST`, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, and `EXPO_PUBLIC_API_URL` into Compose so domains stay out of gitignored env for day-to-day use.

---

## Prerequisites (both environments)

- Docker Engine + Compose plugin
- Git
- User in the `docker` group (or use `sudo docker`)
- Outbound network to the database host

```bash
sudo usermod -aG docker "$USER"
# re-login or: newgrp docker
docker version
docker compose version
```

---

## Development setup (shared EC2)

Use this when Jay shares a machine with other `*-dev.spotynet.com` apps and a **central host nginx** on 80/443.

### 1. Clone / enter repo

```bash
cd /home/spotynet/projects/apps/jay
# or: git clone <repo-url> jay && cd jay
```

### 2. Create secrets file (once)

```bash
cp .env.example backend/.env
# Edit backend/.env — at minimum:
#   SECRET_KEY=...
#   DATABASE_URL=postgres://...
#   DEBUG=True
```

Domains are **not** required in `.env`; `./dev.sh` sets them.

Optional: `mobile/.env` can exist; Compose `environment` from `dev.sh` overrides `EXPO_PUBLIC_API_URL` when you use the script.

### 3. DNS (once, if new hostnames)

Route 53 (or equivalent) A records → EC2 Elastic IP:

- `jay-dev.spotynet.com`
- `jay-api-dev.spotynet.com`

### 4. Wire host nginx → project gateway (once)

Both Jay vhosts must proxy to `127.0.0.1:3010` (not old PM2 ports 3011/3012):

```bash
sudo ./deploy/bootstrap-shared.sh
```

Or nginx only:

```bash
sudo ./deploy/apply-nginx.sh
```

Then ensure TLS certs include both names (Certbot), if not already.

### 5. Start development stack

```bash
./dev.sh
```

### 6. Verify

```bash
curl -I -H 'Host: jay-dev.spotynet.com' http://127.0.0.1:3010/
curl -I -H 'Host: jay-api-dev.spotynet.com' http://127.0.0.1:3010/
curl -I https://jay-dev.spotynet.com/
curl -I https://jay-api-dev.spotynet.com/
```

Public HTTPS may return **403** if your client IP is not in `dev-ip-allow.conf` — that is expected.

### Dev domains

Defined at the top of `dev.sh`:

- Web: `jay-dev.spotynet.com`
- API: `jay-api-dev.spotynet.com`

Change there if you introduce a new shared-EC2 hostname pair; keep host nginx `server_name` / DNS in sync.

---

## Production setup (dedicated machine)

Use this for a machine that **owns port 80** and runs only Jay (or does not share the Spotynet multi-app host nginx).

### 1. Clone repo

```bash
git clone <repo-url> jay
cd jay
git checkout main
```

### 2. Set production domains (once)

Edit the top of `deploy.sh`:

```bash
JAY_WEB_HOST="jay.spotynet.com"
JAY_API_HOST="jay-api.spotynet.com"
```

Or pass hosts at deploy time (no file edit):

```bash
./deploy.sh app.example.com api.example.com
```

### 3. Create secrets (once)

```bash
cp .env.example backend/.env
# Edit backend/.env:
#   DEBUG=False
#   SECRET_KEY=<strong-random>
#   DATABASE_URL=postgres://...
```

### 4. DNS + firewall

- A records for web + API → machine public IP
- Allow inbound **TCP 80** (and **443** if you terminate TLS on this host)

### 5. First deploy

```bash
./deploy.sh
```

This runs `git pull --ff-only`, then:

`docker compose -f compose.yaml -f compose.prod.yaml up -d --build`

### 6. TLS (recommended)

Terminate HTTPS in front of project nginx `:80`, for example:

- Certbot on the host proxying to `127.0.0.1:80`, or
- Cloud load balancer / reverse proxy

`CSRF_TRUSTED_ORIGINS` / `EXPO_PUBLIC_API_URL` from `deploy.sh` use `https://` — align TLS with that.

### 7. Verify

```bash
curl -I -H 'Host: jay.spotynet.com' http://127.0.0.1/
curl -I -H 'Host: jay-api.spotynet.com' http://127.0.0.1/
# after DNS (+ TLS):
curl -I https://jay.spotynet.com/
curl -I https://jay-api.spotynet.com/
```

---

## Day-to-day use guide

### Development (shared EC2)

| Action | Command |
|--------|---------|
| Start / refresh after code changes | `./dev.sh` |
| Logs | `docker compose -f compose.yaml logs -f` |
| Status | `docker compose -f compose.yaml ps` |
| Stop | `docker compose -f compose.yaml down` |

After `git pull` on the shared host, run `./dev.sh` again to rebuild/restart.

### Production (dedicated)

| Action | Command |
|--------|---------|
| Update after merge to `main` | `./deploy.sh` |
| Deploy with one-off domains | `./deploy.sh web.example.com api.example.com` |
| Logs | `docker compose -f compose.yaml -f compose.prod.yaml logs -f` |
| Status | `docker compose -f compose.yaml -f compose.prod.yaml ps` |
| Stop | `./deploy.sh down` |

`./deploy.sh` already runs `git pull --ff-only` before rebuild.

---

## Command cheat sheet

```bash
# --- Dev ---
sudo ./deploy/bootstrap-shared.sh   # once: host nginx → :3010
./dev.sh                            # start/refresh stack

# --- Prod ---
./deploy.sh                         # pull + build + up on :80
./deploy.sh down                    # stop

# --- Inspect ---
docker compose -f compose.yaml ps
docker compose -f compose.yaml logs -f nginx
docker compose -f compose.yaml -f compose.prod.yaml ps
```

---

## Key files

| Path | Role |
|------|------|
| `compose.yaml` | api + mobile + nginx; nginx on `127.0.0.1:3010` |
| `compose.prod.yaml` | Overrides nginx ports to `80:80` |
| `nginx/default.conf.template` | Subdomain → `mobile` / `api` (hosts via env) |
| `dev.sh` | Dev domains + start Compose |
| `deploy.sh` | Prod domains + `git pull` + Compose prod |
| `deploy/bootstrap-shared.sh` | Shared-EC2: host nginx + first compose up |
| `deploy/apply-nginx.sh` | Shared-EC2: patch Jay `proxy_pass` → `3010` only |
| `backend/Dockerfile.dev` | Django `runserver` on `3012` |
| `mobile/Dockerfile.dev` | Expo web on `3011` |
| `backend/.env` | Secrets / DB (gitignored) |
| `.env.example` | Template for `backend/.env` |

---

## Standing up a **new** instance later

### New shared-EC2 style (dev) app hostname

1. Pick ports/gateway (Jay uses project nginx on **3010**; do not clash with other apps).
2. Add DNS + host nginx `server_name` blocks → `127.0.0.1:3010`.
3. Set domains in `dev.sh`.
4. `backend/.env` with DB.
5. `sudo ./deploy/apply-nginx.sh` (or extend bootstrap) + `./dev.sh`.

### New dedicated prod machine

1. Install Docker; clone `main`.
2. Edit domains in `deploy.sh` (or pass args).
3. Create `backend/.env`.
4. DNS + firewall.
5. `./deploy.sh`.
6. Add TLS in front of `:80`.

---

## Notes & caveats

- **Current images are Dockerfile.dev** (Django `runserver`, Expo web). `compose.prod.yaml` means “dedicated host / port 80”, not a fully hardened production image set (Gunicorn, static export, etc.). Same deploy flow applies when prod Dockerfiles are added later.
- **Database** is external (RDS); Compose does not start Postgres.
- On shared EC2, **do not** publish project nginx on host `:80` — that fights central nginx. Use `./dev.sh` only.
- Changing prod domains in a committed `deploy.sh` affects all clones on next pull; for a one-off host use `./deploy.sh web api` args instead.
