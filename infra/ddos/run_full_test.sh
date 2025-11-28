#!/bin/bash
# run_full_test.sh
# Automatiza: captura estado, ejecuta ataques controlados, aplica mitigación, re-evalúa y recopila evidencia.
# Uso:
#   ./run_full_test.sh <TARGET_DOMAIN_OR_IP> <SERVER_SSH_USER@HOST> <ATTACK_DURATION_SECONDS>
# Ejemplo:
#   ./run_full_test.sh target.example.com root@203.0.113.5 30

set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <target> <server_ssh> <attack_duration_seconds>"
  exit 1
fi

TARGET=$1
SERVER_SSH=$2
ATTACK_DURATION=${3}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTDIR=infra/evidence/${TIMESTAMP}
mkdir -p "${OUTDIR}"

echo "Outdir: ${OUTDIR}"

echo "1) Capturar estado inicial (remote)"
ssh -o StrictHostKeyChecking=no ${SERVER_SSH} <<EOF
  set -e
  sudo iptables -L -v -n > /tmp/iptables_before.txt || true
  sudo ipset list > /tmp/ipset_before.txt || true
  sudo docker stats --no-stream --format '{{.Name}},{{.CPUPerc}},{{.MemUsage}}' > /tmp/docker_stats_before.txt || true
  sudo mkdir -p /tmp/evidence_${TIMESTAMP}
  sudo cp /tmp/iptables_before.txt /tmp/evidence_${TIMESTAMP}/ || true
  sudo cp /tmp/ipset_before.txt /tmp/evidence_${TIMESTAMP}/ || true
  sudo cp /tmp/docker_stats_before.txt /tmp/evidence_${TIMESTAMP}/ || true
  # start tcpdump
  sudo pkill -f "tcpdump -i any -w /tmp/attack_capture_${TIMESTAMP}.pcap" || true
  sudo tcpdump -i any -w /tmp/attack_capture_${TIMESTAMP}.pcap &
  echo $! > /tmp/tcpdump_pid_${TIMESTAMP}
EOF

echo "2) Ejecutar ataque (desde esta máquina atacante)"
echo "Duración objetivo: ${ATTACK_DURATION}s"
# Ejecutar el wrapper test_ddos.sh que usa hping3/slowloris/curl
bash infra/ddos/test_ddos.sh ${TARGET} 80 &
ATTACK_PID=$!
sleep ${ATTACK_DURATION}
kill ${ATTACK_PID} || true

echo "3) Recolectar métricas durante/después (remote)"
ssh ${SERVER_SSH} <<EOF
  set -e
  # stop tcpdump
  if [ -f /tmp/tcpdump_pid_${TIMESTAMP} ]; then
    sudo kill \\$(cat /tmp/tcpdump_pid_${TIMESTAMP}) || true
  fi
  sudo mv /tmp/attack_capture_${TIMESTAMP}.pcap /tmp/evidence_${TIMESTAMP}/ || true
  sudo iptables -L -v -n > /tmp/evidence_${TIMESTAMP}/iptables_during_after.txt || true
  sudo ipset list > /tmp/evidence_${TIMESTAMP}/ipset_after.txt || true
  sudo docker stats --no-stream --format '{{.Name}},{{.CPUPerc}},{{.MemUsage}}' > /tmp/evidence_${TIMESTAMP}/docker_stats_after.txt || true
  # collect logs
  sudo mkdir -p /tmp/evidence_${TIMESTAMP}/logs || true
  sudo sh -c "[ -f /var/log/nginx/access.log ] && tail -n 500 /var/log/nginx/access.log > /tmp/evidence_${TIMESTAMP}/logs/nginx_access.txt || true"
  sudo sh -c "[ -f /var/log/nginx/error.log ] && tail -n 500 /var/log/nginx/error.log > /tmp/evidence_${TIMESTAMP}/logs/nginx_error.txt || true"
  sudo docker logs hiafinal_app --since '5m' > /tmp/evidence_${TIMESTAMP}/logs/app_logs.txt || true
  sudo docker logs hiafinal_db --since '5m' > /tmp/evidence_${TIMESTAMP}/logs/db_logs.txt || true
EOF

echo "4) Transferir evidencia al atacante (local)"
scp -r ${SERVER_SSH}:/tmp/evidence_${TIMESTAMP} ${OUTDIR}/ || true

echo "5) Aplicar mitigación (remote) - ejemplo: bloquear la IP del atacante"
# Intentamos detectar IP local atacante desde aquí (puede fallar si NAT)
MY_IP=$(curl -s https://ifconfig.me || echo "") || true
if [ -n "${MY_IP}" ]; then
  echo "Añadiendo ${MY_IP} a blocklist en el servidor"
  ssh ${SERVER_SSH} "sudo bash -s" <<'MIT'
  set -e
  ipset create blocklist-ddos hash:ip -exist
  ipset add blocklist-ddos ${MY_IP} -exist || true
  iptables -I INPUT -m set --match-set blocklist-ddos src -j DROP || true
MIT
else
  echo "No se pudo obtener IP pública local. Por favor ejecuta mitigate.sh en el servidor con la IP atacante detectada."
fi

echo "6) Re-ejecutar prueba corta para validar mitigación (10s)"
bash infra/ddos/test_ddos.sh ${TARGET} 80 &
SHORT_PID=$!
sleep 10
kill ${SHORT_PID} || true

echo "7) Recolectar estado final (remote)"
ssh ${SERVER_SSH} <<EOF
  set -e
  sudo docker stats --no-stream --format '{{.Name}},{{.CPUPerc}},{{.MemUsage}}' > /tmp/evidence_${TIMESTAMP}/docker_stats_final.txt || true
  sudo iptables -L -v -n > /tmp/evidence_${TIMESTAMP}/iptables_final.txt || true
  sudo ipset list > /tmp/evidence_${TIMESTAMP}/ipset_final.txt || true
EOF

echo "8) Transferir estado final"
scp -r ${SERVER_SSH}:/tmp/evidence_${TIMESTAMP} ${OUTDIR}/ || true

echo "9) Generar reporte básico usando python (docker stats comparison)"
if command -v python3 >/dev/null 2>&1; then
  python3 infra/ddos/generate_report.py ${OUTDIR}/evidence_${TIMESTAMP} || true
else
  echo "python3 no disponible localmente. Omitiendo generación de gráficos."
fi

echo "Prueba completada. Evidence directory: ${OUTDIR}"
