#!/bin/bash
# setup_ufw.sh
# Script para configurar UFW de manera segura (Ubuntu/Debian)
# Uso: sudo bash setup_ufw.sh

set -euo pipefail

if ! command -v ufw >/dev/null 2>&1; then
  echo "Instalando ufw..."
  apt-get update; apt-get install -y ufw
fi

echo "Configurando políticas por defecto"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

echo "Permitir SSH con limit y puertos de aplicación"
ufw allow OpenSSH
ufw limit OpenSSH

# Puertos de la aplicación (ajustar según despliegue)
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # App Next.js (si se expone directamente)

# Limitar conexiones para mitigar ataques simples
ufw limit 80/tcp
ufw limit 443/tcp

echo "Habilitando UFW y mostrando status"
ufw --force enable
ufw status verbose

echo "Ajustes de sysctl recomendados para hardening (persistir manualmente en /etc/sysctl.conf)"
echo "net.ipv4.tcp_syncookies = 1"
echo "net.ipv4.tcp_max_syn_backlog = 2048"

echo "Listo. Revisa infra/firewall/iptables_rules.sh para reglas avanzadas (ipset, rate-limit)."
