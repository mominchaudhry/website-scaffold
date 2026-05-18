#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PROJECT_DIR_NAME="$(basename "$ROOT_DIR")"
PROJECT_SLUG="$(echo "$PROJECT_DIR_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/_/g' | sed 's/^_*//' | sed 's/__*/_/g' | sed 's/_*$//')"
PROJECT_SLUG="${PROJECT_SLUG:-scaffold}"
BUCKET_SLUG="$(echo "$PROJECT_DIR_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/^-*//' | sed 's/--*/-/g' | sed 's/-*$//')"
BUCKET_SLUG="${BUCKET_SLUG:-scaffold}"

LOCAL_DB_NAME="${PROJECT_SLUG}"
DEFAULT_PG_PORT="5432"
DEFAULT_MINIO_PORT="9000"
DEFAULT_MINIO_CONSOLE_PORT="9001"
DEFAULT_WEB_PORT="3000"
DEFAULT_CMS_PORT="1337"

bash ./scripts/setup-local-env.sh

upsert_env_file() {
  local file="$1"
  local key="$2"
  local value="$3"
  local tmp_file

  tmp_file="$(mktemp)"
  awk -v key="$key" -v value="$value" '
    BEGIN { updated = 0 }
    {
      if ($0 ~ "^" key "=") {
        print key "=" value
        updated = 1
      } else {
        print $0
      }
    }
    END {
      if (updated == 0) {
        print key "=" value
      }
    }
  ' "$file" >"$tmp_file"

  mv "$tmp_file" "$file"
}

_ALLOCATED_PORTS_FILE="$(mktemp)"

is_port_in_use() {
  local port="$1"

  if grep -qw "$port" "$_ALLOCATED_PORTS_FILE" 2>/dev/null; then
    return 0
  fi

  if command -v lsof >/dev/null 2>&1; then
    if lsof -iTCP:"$port" -sTCP:LISTEN -n -P >/dev/null 2>&1; then
      return 0
    fi
  fi

  if command -v ss >/dev/null 2>&1; then
    if ss -ltn "( sport = :$port )" | grep -q LISTEN; then
      return 0
    fi
  fi

  if command -v netstat >/dev/null 2>&1; then
    if netstat -an 2>/dev/null | grep -E "LISTEN" | grep -q "[\\.:]${port}[[:space:]]"; then
      return 0
    fi
  fi

  return 1
}

pick_available_port() {
  local preferred="$1"
  local service_name="$2"
  local port="$preferred"
  local max_tries=50

  for _ in $(seq 1 "$max_tries"); do
    if ! is_port_in_use "$port"; then
      if [[ "$port" != "$preferred" ]]; then
        echo "[dev:local] Port ${preferred} is busy for ${service_name}; using ${port} instead." >&2
      fi
      echo "$port" >> "$_ALLOCATED_PORTS_FILE"
      echo "$port"
      return 0
    fi
    port=$((port + 1))
  done

  echo "[dev:local] Could not find a free port for ${service_name} starting at ${preferred}." >&2
  return 1
}

PG_PORT="$(pick_available_port "$DEFAULT_PG_PORT" "Postgres")"
MINIO_PORT="$(pick_available_port "$DEFAULT_MINIO_PORT" "MinIO")"
MINIO_CONSOLE_PORT="$(pick_available_port "$DEFAULT_MINIO_CONSOLE_PORT" "MinIO Console")"
WEB_PORT="$(pick_available_port "$DEFAULT_WEB_PORT" "Next.js")"
CMS_PORT="$(pick_available_port "$DEFAULT_CMS_PORT" "Strapi")"

LOCAL_DB_URL="postgres://postgres:postgres@127.0.0.1:${PG_PORT}/${LOCAL_DB_NAME}"
LOCAL_ADMIN_DB_URL="postgres://postgres:postgres@127.0.0.1:${PG_PORT}/postgres"

WEB_URL="http://127.0.0.1:${WEB_PORT}"
CMS_URL="http://127.0.0.1:${CMS_PORT}"

export POSTGRES_DB="$LOCAL_DB_NAME"
export POSTGRES_PORT="$PG_PORT"
export MINIO_PORT="$MINIO_PORT"
export MINIO_CONSOLE_PORT="$MINIO_CONSOLE_PORT"
export MINIO_BUCKET="$BUCKET_SLUG"

upsert_env_file "apps/cms/.env" "DATABASE_CLIENT" "postgres"
upsert_env_file "apps/cms/.env" "DATABASE_URL" "$LOCAL_DB_URL"
upsert_env_file "apps/cms/.env" "DATABASE_SSL" "false"
upsert_env_file "apps/cms/.env" "HOST" "0.0.0.0"
upsert_env_file "apps/cms/.env" "PORT" "$CMS_PORT"
upsert_env_file "apps/cms/.env" "CLIENT_URL" "$WEB_URL"
upsert_env_file "apps/cms/.env" "REVALIDATE_WEBHOOK_URL" "${WEB_URL}/api/revalidate"
upsert_env_file "apps/cms/.env" "S3_ACCESS_KEY_ID" "minioadmin"
upsert_env_file "apps/cms/.env" "S3_ACCESS_SECRET" "minioadmin"
upsert_env_file "apps/cms/.env" "S3_REGION" "us-east-1"
upsert_env_file "apps/cms/.env" "S3_BUCKET" "$BUCKET_SLUG"
upsert_env_file "apps/cms/.env" "S3_ENDPOINT" "http://127.0.0.1:${MINIO_PORT}"
upsert_env_file "apps/cms/.env" "S3_FORCE_PATH_STYLE" "true"

upsert_env_file "apps/web/.env.local" "NEXT_PUBLIC_SITE_URL" "$WEB_URL"
upsert_env_file "apps/web/.env.local" "STRAPI_API_URL" "$CMS_URL"

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running. Start Docker Desktop (or Docker Engine) and rerun 'pnpm dev:local'."
  exit 1
fi

pnpm infra:down 2>/dev/null || true
pnpm infra:up

echo "Waiting for Postgres to become ready..."
for attempt in {1..60}; do
  if docker compose -f docker-compose.selfhost.yml exec -T postgres pg_isready -U postgres -d postgres >/dev/null 2>&1; then
    echo "Postgres is ready."
    break
  fi

  if [[ "$attempt" -eq 60 ]]; then
    echo "Postgres did not become ready in time."
    exit 1
  fi

  sleep 1
  echo "  still waiting (${attempt}s)"
done

export DATABASE_CLIENT="postgres"
export DATABASE_URL="$LOCAL_DB_URL"
export DATABASE_SSL="false"
export HOST="0.0.0.0"
export CLIENT_URL="$WEB_URL"
export REVALIDATE_WEBHOOK_URL="${WEB_URL}/api/revalidate"
export S3_ACCESS_KEY_ID="minioadmin"
export S3_ACCESS_SECRET="minioadmin"
export S3_REGION="us-east-1"
export S3_BUCKET="$BUCKET_SLUG"
export S3_ENDPOINT="http://127.0.0.1:${MINIO_PORT}"
export S3_FORCE_PATH_STYLE="true"

export NEXT_PUBLIC_SITE_URL="$WEB_URL"
export STRAPI_API_URL="$CMS_URL"

LOCAL_DB_NAME="$LOCAL_DB_NAME" \
LOCAL_ADMIN_DB_URL="$LOCAL_ADMIN_DB_URL" \
LOCAL_APP_DB_URL="$LOCAL_DB_URL" \
pnpm --filter @scaffold/cms exec node ../../scripts/ensure-local-db.mjs

echo "[dev:local] Project: ${PROJECT_SLUG} (db: ${LOCAL_DB_NAME}, bucket: ${BUCKET_SLUG})"
echo "[dev:local] Postgres: 127.0.0.1:${PG_PORT} | MinIO: 127.0.0.1:${MINIO_PORT}"
echo "[dev:local] Strapi URL: ${CMS_URL}"
echo "[dev:local] Web URL: ${WEB_URL}"

cleanup() {
  if [[ -n "${CMS_PID:-}" ]]; then
    kill "$CMS_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "${WEB_PID:-}" ]]; then
    kill "$WEB_PID" >/dev/null 2>&1 || true
  fi
  rm -f "$_ALLOCATED_PORTS_FILE"
}

trap cleanup EXIT INT TERM

DATABASE_CLIENT="$DATABASE_CLIENT" \
DATABASE_URL="$DATABASE_URL" \
DATABASE_SSL="$DATABASE_SSL" \
HOST="$HOST" \
PORT="$CMS_PORT" \
CLIENT_URL="$CLIENT_URL" \
REVALIDATE_WEBHOOK_URL="$REVALIDATE_WEBHOOK_URL" \
S3_ACCESS_KEY_ID="$S3_ACCESS_KEY_ID" \
S3_ACCESS_SECRET="$S3_ACCESS_SECRET" \
S3_REGION="$S3_REGION" \
S3_BUCKET="$S3_BUCKET" \
S3_ENDPOINT="$S3_ENDPOINT" \
S3_FORCE_PATH_STYLE="$S3_FORCE_PATH_STYLE" \
pnpm --filter @scaffold/cms dev &
CMS_PID=$!

NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" \
STRAPI_API_URL="$STRAPI_API_URL" \
PORT="$WEB_PORT" \
pnpm --filter @scaffold/web dev &
WEB_PID=$!

EXIT_CODE=0
while true; do
  if ! kill -0 "$CMS_PID" >/dev/null 2>&1; then
    wait "$CMS_PID" || EXIT_CODE=$?
    break
  fi

  if ! kill -0 "$WEB_PID" >/dev/null 2>&1; then
    wait "$WEB_PID" || EXIT_CODE=$?
    break
  fi

  sleep 1
done

exit "$EXIT_CODE"
