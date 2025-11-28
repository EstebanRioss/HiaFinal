#!/bin/bash
set -e

PRIMARY_HOST=${PRIMARY_HOST:-db_primary}
PRIMARY_PORT=${PRIMARY_PORT:-5432}
REPL_USER=${REPL_USER:-replicator}
REPL_PASSWORD=${REPL_PASSWORD:-replica_pass}
PGDATA=${PGDATA:-/var/lib/postgresql/data}

if [ -s "$PGDATA/PG_VERSION" ]; then
  echo "Replica data already exists in $PGDATA — skipping basebackup"
  exit 0
fi

echo "Waiting for primary ($PRIMARY_HOST:$PRIMARY_PORT)..."
until pg_isready -h "$PRIMARY_HOST" -p "$PRIMARY_PORT" -U "$REPL_USER" >/dev/null 2>&1; do sleep 1; done

export PGPASSWORD="$REPL_PASSWORD"

echo "Running pg_basebackup from $PRIMARY_HOST..."
pg_basebackup -h "$PRIMARY_HOST" -D "$PGDATA" -U "$REPL_USER" -v -P --wal-method=stream

cat >> "$PGDATA/postgresql.auto.conf" <<EOF
primary_conninfo = 'host=${PRIMARY_HOST} port=${PRIMARY_PORT} user=${REPL_USER} password=${REPL_PASSWORD}'
hot_standby = on
EOF

touch "$PGDATA/standby.signal"
chown -R postgres:postgres "$PGDATA" || true

echo "Replica basebackup complete."
