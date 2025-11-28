#!/bin/bash
set -e

PRIMARY_HOST=${PRIMARY_HOST:-db_primary}
PRIMARY_PORT=${PRIMARY_PORT:-5432}
REPLICA_HOST=${REPLICA_HOST:-db_replica}
REPLICA_PORT=${REPLICA_PORT:-5432}
PGUSER=${PGUSER:-postgres}
PGPASSWORD=${PGPASSWORD:-postgres}

export PGPASSWORD

log() { echo "[failover] $(date -u +'%Y-%m-%dT%H:%M:%SZ') - $*"; }

while true; do
  if pg_isready -h "${PRIMARY_HOST}" -p "${PRIMARY_PORT}" -U "${PGUSER}" >/dev/null 2>&1; then
    # Primary is up
    sleep 2
    continue
  fi

  log "Primary ${PRIMARY_HOST}:${PRIMARY_PORT} not reachable. Checking replica..."

  if ! pg_isready -h "${REPLICA_HOST}" -p "${REPLICA_PORT}" -U "${PGUSER}" >/dev/null 2>&1; then
    log "Replica ${REPLICA_HOST}:${REPLICA_PORT} not reachable either. Retrying in 5s."
    sleep 5
    continue
  fi

  # Check if replica is still in recovery (standby)
  IN_RECOVERY=$(psql -h "${REPLICA_HOST}" -p "${REPLICA_PORT}" -U "${PGUSER}" -tAc "SELECT pg_is_in_recovery();") || true
  IN_RECOVERY=$(echo "$IN_RECOVERY" | tr -d '[:space:]')

  if [ "$IN_RECOVERY" = "t" ] || [ "$IN_RECOVERY" = "true" ]; then
    log "Replica is in recovery. Attempting promotion on ${REPLICA_HOST}."
    psql -h "${REPLICA_HOST}" -p "${REPLICA_PORT}" -U "${PGUSER}" -c "SELECT pg_promote(wait_seconds => 60);"
    if [ $? -eq 0 ]; then
      log "Promotion command issued to ${REPLICA_HOST}. Waiting for it to become primary."
      # Give some time for promotion to complete and for HAProxy health checks to follow
      sleep 5
    else
      log "Promotion failed or returned non-zero. Will retry shortly."
      sleep 5
    fi
  else
    log "Replica already primary (not in recovery) — nothing to do."
    sleep 5
  fi

done
