#!/bin/bash
# iptables_rules.sh
# Reglas recomendadas (iptables + ipset) para mitigación básica de DDoS
# Uso: sudo bash iptables_rules.sh

set -euo pipefail

if ! command -v iptables >/dev/null 2>&1; then
  echo "iptables no encontrado. Instala iptables."; exit 1
fi

echo "Vaciando reglas anteriores (usa con precaución)"
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X

echo "Reglas basicas: permitir loopback y conexiones establecidas"
iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

echo "Descartar paquetes inválidos"
iptables -A INPUT -m conntrack --ctstate INVALID -j DROP

echo "Permitir ICMP (limitado)"
iptables -A INPUT -p icmp -m limit --limit 1/second -j ACCEPT

echo "Permitir SSH/HTTP/HTTPS"
iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --set --name SSH
iptables -A INPUT -p tcp --dport 22 -m recent --update --seconds 60 --hitcount 10 --rttl --name SSH -j DROP
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# HTTP/HTTPS: rate limiting new connections
iptables -A INPUT -p tcp --dport 80 -m conntrack --ctstate NEW -m limit --limit 25/minute --limit-burst 100 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j DROP
iptables -A INPUT -p tcp --dport 443 -m conntrack --ctstate NEW -m limit --limit 25/minute --limit-burst 100 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j DROP

echo "Habilitar SYN cookies"
sysctl -w net.ipv4.tcp_syncookies=1 >/dev/null

echo "Rechazar por defecto"
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

echo "Reglas aplicadas. Considera persistir las reglas con iptables-persistent o un systemd unit."
