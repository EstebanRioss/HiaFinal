#!/bin/bash
# mitigate.sh
# Script de mitigación que aplica ipset + iptables para bloquear IPs listas y hardening TCP
# Uso: sudo bash mitigate.sh <ip1> [ip2 ...]

set -euo pipefail

if ! command -v ipset >/dev/null 2>&1; then
  echo "Instalando ipset..."; apt-get update; apt-get install -y ipset
fi

if ! command -v iptables >/dev/null 2>&1; then
  echo "iptables no encontrado. Instala iptables."; exit 1
fi

if [ "$#" -lt 1 ]; then
  echo "Uso: $0 <ip1> [ip2 ...]"; exit 1
fi

SETNAME=blocklist-ddos

ipset create $SETNAME hash:ip -exist

for ip in "$@"; do
  echo "Añadiendo $ip a $SETNAME"
  ipset add $SETNAME $ip -exist
done

echo "Asegurando regla iptables para bloquear el ipset"
iptables -I INPUT -m set --match-set $SETNAME src -j DROP || true

echo "Habilitando SYN cookies y ajustando backlog"
sysctl -w net.ipv4.tcp_syncookies=1
sysctl -w net.ipv4.tcp_max_syn_backlog=2048

echo "Listo. Para persistir ipset/iptables al reinicio, usa ipset save/restore y iptables-persistent o crea unit systemd."
