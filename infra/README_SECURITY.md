# Seguridad: Firewall, DDoS y SSL/TLS

Este directorio contiene scripts y plantillas para configurar un firewall (UFW/iptables), realizar pruebas controladas de DDoS y aplicar mitigaciones, y habilitar SSL/TLS mediante Nginx + Let's Encrypt.

IMPORTANTE: Ejecuta las pruebas de ataque únicamente en entornos de laboratorio o con autorización expresa. No realices DDoS contra sistemas de terceros.

- `infra/firewall/setup_ufw.sh`: script para configurar UFW de forma básica.
- `infra/firewall/iptables_rules.sh`: reglas iptables con rate-limiting y hardening básico.
- `infra/ddos/slowloris.py`: PoC de Slowloris (Python). Usar con permiso.
- `infra/ddos/test_ddos.sh`: wrapper para pruebas (hping3, slowloris, curl).
- `infra/ddos/mitigate.sh`: añade IPs a `ipset` y reglas iptables para bloqueo rápido.
- `infra/ssl/nginx_site.conf`: plantilla de Nginx para SSL (reemplazar `example.com`).

Guía rápida:

1) Habilitar UFW (host):

   sudo bash infra/firewall/setup_ufw.sh

2) Reglas avanzadas con iptables (host):

   sudo bash infra/firewall/iptables_rules.sh

3) Mitigación rápida ante ataque identificado (bloquear IPs):

   sudo bash infra/ddos/mitigate.sh 1.2.3.4 5.6.7.8

4) Pruebas de ataque controladas (ejecutar desde otra máquina de prueba):

   # hping3 debe estar instalado en la máquina atacante
   bash infra/ddos/test_ddos.sh target.example.com 80

5) Obtener certificados Let's Encrypt (ejemplo con certbot standalone):

   sudo apt-get install -y certbot
   sudo certbot certonly --standalone -d example.com -d www.example.com

   Después de obtener los certificados, ajusta `infra/ssl/nginx_site.conf` con las rutas correctas y copia el archivo a `/etc/nginx/sites-available/`.

6) Reiniciar Nginx:

   sudo systemctl reload nginx

Notas y recomendaciones:
- Para mitigaciones más robustas usa `fail2ban`, `mod_evasive` (nginx/apache), Cloudflare o WAF comerciales.
- Para despliegues en Docker, coloca Nginx como reverse-proxy (servicio) y monta `/etc/letsencrypt` para que certbot pueda actualizar certs.
- Considera automatizar la persistencia de `iptables` e `ipset` con `iptables-persistent` y `ipset save`.
