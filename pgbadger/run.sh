#!/bin/sh

while true; do
  echo "Esperando logs de Postgres con contenido..."
  i=0

  # Espera hasta 300s por logs con tamaño mayor a 0
  while [ "$(find /var/lib/postgresql/data/log -type f -size +0c 2>/dev/null | wc -l)" -eq 0 ]; do
    sleep 1
    i=$((i+1))
    if [ "$i" -gt 300 ]; then
      echo "No se encontraron logs con contenido tras 300s."
      break
    fi
  done

  if [ "$(find /var/lib/postgresql/data/log -type f -size +0c 2>/dev/null | wc -l)" -gt 0 ]; then
    echo "Generando reporte..."
    # Forcer el formato: use 'stderr' (default Postgres logging destination).
    # If you use CSV logs set -f csvlog instead.
    pgbadger -f stderr /var/lib/postgresql/data/log/*.log -o /out/report.html 2>/out/pgbadger.err || true
    echo "Reporte generado."
  else
    echo "No hay logs con contenido."
  fi

  echo "Durmiendo 3600s..."
  sleep 3600
done