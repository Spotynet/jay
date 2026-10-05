# Jay: develop vs production

## Workflow

| When | Where | Command |
|------|--------|---------|
| First time on shared EC2 | Dev host | Install Docker; `sudo ./deploy/bootstrap-shared.sh` (once) |
| Day-to-day / refresh | Dev host | `./dev.sh` |
| First time on prod machine | Prod host | Docker + `backend/.env` (secrets) + DNS; edit domains at top of `deploy.sh` if needed |
| After merge to `main` | Prod host | `./deploy.sh` (`git pull` + rebuild) |

**Domains** live in the scripts (committed):

- `dev.sh` → `jay-dev.spotynet.com` / `jay-api-dev.spotynet.com`
- `deploy.sh` → edit `JAY_WEB_HOST` / `JAY_API_HOST` at the top (or pass as args)

**Secrets** (`SECRET_KEY`, `DATABASE_URL`, …) stay in gitignored `backend/.env`.

## Commands

```bash
./dev.sh                                    # development
./deploy.sh                                 # production (uses domains in deploy.sh)
./deploy.sh app.example.com api.example.com # production with one-off hosts
./deploy.sh down                            # stop production
```

## Shared EC2 (dev) — once

```bash
sudo ./deploy/bootstrap-shared.sh
./dev.sh
```

## Dedicated production — once, then only deploy

1. Edit domains at the top of `deploy.sh` (or pass them as args).
2. Create `backend/.env` with `SECRET_KEY`, `DATABASE_URL`, `DEBUG=False`, etc.
3. DNS → machine IP; open port 80 (and 443 if TLS).
4. `./deploy.sh`

After each merge to main:

```bash
./deploy.sh
```
