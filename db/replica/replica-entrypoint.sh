#!/bin/bash
set -e

PGDATA=/var/lib/postgresql/data
PRIMARY_HOST=${PRIMARY_HOST:-db_primary}
PRIMARY_PORT=${PRIMARY_PORT:-5432}
REPL_USER=${REPL_USER:-replicator}
REPL_PASSWORD=${REPL_PASSWORD:-replica_pass}

export PGPASSWORD="$REPL_PASSWORD"

if [ -z "$(ls -A "$PGDATA")" ]; then
  echo "Initializing replica from primary $PRIMARY_HOST"
  until pg_isready -h "$PRIMARY_HOST" -p "$PRIMARY_PORT" -U postgres; do
    echo "Waiting for primary to be ready..."
    sleep 2
  done

  pg_basebackup -h "$PRIMARY_HOST" -D "$PGDATA" -U "$REPL_USER" -vP --wal-method=stream

  # Signal standby mode (Postgres 12+)
  touch "$PGDATA/standby.signal"

  # Configure connection info for continuous replication
  echo "primary_conninfo = 'host=$PRIMARY_HOST port=$PRIMARY_PORT user=$REPL_USER password=$REPL_PASSWORD'" >> "$PGDATA/postgresql.auto.conf"

  chown -R postgres:postgres "$PGDATA"
fi

exec docker-entrypoint.sh postgres
