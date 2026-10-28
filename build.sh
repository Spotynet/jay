#!/usr/bin/env bash
# Jay — build production images and push to Amazon ECR.
#
# Run on a builder/dev machine (Docker + AWS CLI + ECR push IAM). Prefer not on prod.
#
#   ./build.sh
#   JAY_IMAGE_TAG=v1.2.3 ./build.sh
#   PUSH=0 ./build.sh                          # build/tag only (any branch OK)
#
# Push to ECR is only allowed on the repo default branch (origin/HEAD, currently
# main). Override only in emergencies: ALLOW_NON_DEFAULT_BRANCH=1 ./build.sh
#
# Requires deploy.env with AWS_ACCOUNT_ID (see deploy.env.example).
# After push, on prod: JAY_IMAGE_TAG=<tag> ./deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# shellcheck source=deploy/lib-ecr.sh
source "$ROOT/deploy/lib-ecr.sh"

load_deploy_env "$ROOT"
resolve_ecr_registry

# Default branch from remote (falls back to master)
DEFAULT_BRANCH="$(git symbolic-ref -q refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || true)"
DEFAULT_BRANCH="${DEFAULT_BRANCH:-master}"
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

PUSH="${PUSH:-1}"
ALLOW_NON_DEFAULT_BRANCH="${ALLOW_NON_DEFAULT_BRANCH:-0}"
SKIP_BRANCH_TAG="${SKIP_BRANCH_TAG:-0}"
# Back-compat alias
if [[ "${SKIP_MASTER_TAG:-0}" == "1" ]]; then
  SKIP_BRANCH_TAG=1
fi

if [[ "$PUSH" == "1" && "$CURRENT_BRANCH" != "$DEFAULT_BRANCH" && "$ALLOW_NON_DEFAULT_BRANCH" != "1" ]]; then
  echo "Refusing to push ECR images from branch '${CURRENT_BRANCH}'." >&2
  echo "Checkout the default branch '${DEFAULT_BRANCH}' first (keeps git and images aligned)." >&2
  echo "Local-only build: PUSH=0 ./build.sh" >&2
  echo "Emergency override: ALLOW_NON_DEFAULT_BRANCH=1 ./build.sh" >&2
  exit 1
fi

# Tag: explicit env, else full git SHA
if [[ -z "${JAY_IMAGE_TAG:-}" ]]; then
  JAY_IMAGE_TAG="$(git rev-parse HEAD)"
fi

# Public API URL baked into mobile client bundle at build time
JAY_API_HOST="${JAY_API_HOST:-jay-api.spotynet.com}"
EXPO_PUBLIC_API_URL="${EXPO_PUBLIC_API_URL:-https://${JAY_API_HOST}}"

docker_cmd() {
  if docker info >/dev/null 2>&1; then
    docker "$@"
  elif sudo -n docker info >/dev/null 2>&1; then
    sudo docker "$@"
  else
    echo "Docker needs privileges. Prefer: sudo usermod -aG docker \$USER && newgrp docker" >&2
    sudo docker "$@"
  fi
}

echo "Building Jay images for ECR..."
echo "  branch:   ${CURRENT_BRANCH} (default: ${DEFAULT_BRANCH})"
echo "  registry: ${JAY_IMAGE_REGISTRY}"
echo "  tag:      ${JAY_IMAGE_TAG}"
echo "  api host: ${JAY_API_HOST}"

build_one() {
  local name="$1"
  local dockerfile="$2"
  local target="${3:-}"
  local image="${JAY_IMAGE_REGISTRY}/${name}"
  local -a args=(
    build
    -f "$dockerfile"
    -t "${image}:${JAY_IMAGE_TAG}"
  )
  if [[ -n "$target" ]]; then
    args+=(--target "$target")
  fi
  args+=(
    --build-arg "EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}"
    .
  )
  echo "==> ${name}"
  docker_cmd "${args[@]}"
  if [[ "$SKIP_BRANCH_TAG" != "1" && "${JAY_IMAGE_TAG}" != "${DEFAULT_BRANCH}" ]]; then
    docker_cmd tag "${image}:${JAY_IMAGE_TAG}" "${image}:${DEFAULT_BRANCH}"
  fi
}

build_one api docker/api/Dockerfile
build_one mobile docker/mobile/Dockerfile production

if [[ "$PUSH" != "1" ]]; then
  echo "PUSH=0 — skipping ECR login/push."
  echo "Local tags: ${JAY_IMAGE_REGISTRY}/{api,mobile}:${JAY_IMAGE_TAG}"
  exit 0
fi

ecr_login

push_one() {
  local name="$1"
  local image="${JAY_IMAGE_REGISTRY}/${name}"
  echo "==> push ${name}:${JAY_IMAGE_TAG}"
  docker_cmd push "${image}:${JAY_IMAGE_TAG}"
  if [[ "$SKIP_BRANCH_TAG" != "1" && "${JAY_IMAGE_TAG}" != "${DEFAULT_BRANCH}" ]]; then
    echo "==> push ${name}:${DEFAULT_BRANCH}"
    docker_cmd push "${image}:${DEFAULT_BRANCH}"
  fi
}

push_one api
push_one mobile

echo
echo "Pushed:"
echo "  ${JAY_IMAGE_REGISTRY}/api:${JAY_IMAGE_TAG}"
echo "  ${JAY_IMAGE_REGISTRY}/mobile:${JAY_IMAGE_TAG}"
if [[ "$SKIP_BRANCH_TAG" != "1" && "${JAY_IMAGE_TAG}" != "${DEFAULT_BRANCH}" ]]; then
  echo "  (+ :${DEFAULT_BRANCH} on each)"
fi
echo
echo "On prod:"
echo "  JAY_IMAGE_TAG=${JAY_IMAGE_TAG} ./deploy.sh"
echo "  # or: ./deploy.sh   # uses :${DEFAULT_BRANCH} if that is JAY_IMAGE_TAG in deploy.env"
