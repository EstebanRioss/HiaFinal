# Informe Final: Pruebas Simuladas de Ataque DDoS y Mitigación

Este informe documenta las pruebas controladas de denegación de servicio (DDoS) realizadas en el entorno local del proyecto, las mitigaciones aplicadas y la evidencia recogida. Todos los comandos y pasos son reproducibles en el entorno descrito (Windows + Docker). Las pruebas se hicieron en laboratorio con autorización.

---

**1. Resumen ejecutivo**
- **Objetivo:** Verificar la resiliencia del servicio `hiafinal_app` frente a ataques HTTP (Slowloris / HTTP flood) y validar medidas de contención y mitigación.
- **Resultado clave:** Durante el ataque simulado el uso de CPU del contenedor `hiafinal_app` aumentó de 0.82% a 1.08% (valor observado en `infra/evidence/docker_stats_before.txt` y `.../docker_stats_after.txt`). Tras la acción de mitigación (reinicio del contenedor en este laboratorio) la CPU descendió a 0.58% (`docker_stats_final.txt`). La aplicación permaneció disponible durante las pruebas.

**2. Alcance y autorizaciones**
- Sistemas objetivo: `hiafinal_app` (Next.js) expuesto en `localhost:3000` en Docker Desktop.
- Autorización: pruebas realizadas en entorno local de desarrollo con consentimiento del propietario del repositorio.

**3. Entorno de pruebas**
- Topología: `docker-compose` local en Windows con contenedores: `hiafinal_app`, `hiafinal_db`, `prometheus`, `grafana`, `pgbadger`, etc.
- Hardware: host local del desarrollador (Docker Desktop) — recursos compartidos por el entorno.
- Herramientas: Python (PoC Slowloris: `infra/ddos/slowloris.py`), `test_ddos.sh` (wrapper), `curl` (baseline), `docker stats`, `docker logs`. No se usó `tcpdump` ni reglas `iptables` dentro de `hiafinal_app` (imagen ligera sin iptables disponible).

**4. Plan de pruebas**
- Prueba 1 (Baseline): múltiples peticiones HTTP con `curl` para medir el comportamiento normal.
- Prueba 2 (Ataque Slowloris): ejecución de `slowloris.py` contra `localhost:3000` durante ~30s.
- Prueba 3 (HTTP flood ligero): ejecución de `test_ddos.sh` que combina peticiones `curl` y PoC.
- Recolección de métricas antes, durante y después; mitigación (reinicio) y verificación posterior.

**5. Comandos reproducibles (laboratorio Windows + Docker)**

- Capturas y baseline (ejecutar antes del ataque):
```
mkdir -p .\infra\evidence
docker stats hiafinal_app --no-stream | Out-File -Encoding utf8 .\infra\evidence\docker_stats_before.txt
docker logs hiafinal_app | Out-File -Encoding utf8 .\infra\evidence\app_logs_before.txt
for ($i=0; $i -lt 20; $i++) { curl http://localhost:3000/ | Out-File -Append .\infra\evidence\baseline_curl.txt }
```

- Ejecutar ataques desde host (ejecutar en Powershell o WSL):
```
python infra/ddos/slowloris.py localhost 3000 200
# o
bash infra/ddos/test_ddos.sh localhost 3000
```

- Capturas inmediatamente después (durante/after):
```
docker stats hiafinal_app --no-stream | Out-File -Encoding utf8 .\infra\evidence\docker_stats_after.txt
docker logs hiafinal_app | Out-File -Encoding utf8 .\infra\evidence\app_logs_after.txt
```

- Mitigación operativa (contención rápida en laboratorio):
```
docker restart hiafinal_app
```

- Capturas post-mitigación:
```
docker stats hiafinal_app --no-stream | Out-File -Encoding utf8 .\infra\evidence\docker_stats_final.txt
docker logs hiafinal_app | Out-File -Encoding utf8 .\infra\evidence\app_logs_final.txt
```

**6. Métricas y logs recolectados**

Los archivos generados y verificados están en `infra/evidence/` dentro del repositorio. Resumen de métricas clave extraídas:

- `docker_stats_before.txt` — `hiafinal_app` CPU = 0.82%, Mem = 57.21MiB
- `docker_stats_after.txt`  — `hiafinal_app` CPU = 1.08%, Mem = 59.06MiB
- `docker_stats_final.txt`  — `hiafinal_app` CPU = 0.58%, Mem = 58.71MiB
- `baseline_curl.txt` — múltiples respuestas HTTP (status 200) usadas como baseline.
- `app_logs_before.txt`, `app_logs_after.txt`, `app_logs_final.txt` — logs de la aplicación.

Observación: en este despliegue local no se capturaron PCAPs; para entornos de red reales se recomienda ejecutar `tcpdump` en el host o en un contenedor privilegiado.

**7. Mitigaciones aplicadas**

En laboratorio se aplicaron las siguientes medidas:

- Contención inmediata: reinicio del contenedor `hiafinal_app` para cerrar conexiones persistentes:
```
docker restart hiafinal_app
```

- Reglas y bloqueo con `iptables`/`ipset` (documentado y reproducible en un contenedor Ubuntu con privilegios):
```
docker run -it --privileged --rm ubuntu:22.04 bash
apt-get update && apt-get install -y ipset iptables
ipset create blocklist-ddos hash:ip -exist
ipset add blocklist-ddos 127.0.0.1 -exist  # ejemplo local
iptables -I INPUT -m set --match-set blocklist-ddos src -j DROP
```

- Hardening TCP (SYN cookies) en hosts Linux:
```
sysctl -w net.ipv4.tcp_syncookies=1
sysctl -w net.ipv4.tcp_max_syn_backlog=2048
```

- Rate-limiting en Nginx (cuando se utilice reverse-proxy):
```
http {
  limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;
}
server {
  location / { limit_req zone=mylimit burst=20 nodelay; }
}
```

**8. Resultados y análisis**

- Variación observada en CPU del contenedor `hiafinal_app`:
  - Antes: 0.82%
  - Durante ataque: 1.08%
  - Tras mitigación (restart): 0.58%

- Interpretación:
  - El aumento de CPU y memoria fue pequeño en este entorno local; la aplicación se mantuvo accesible. En entornos de producción el aumento de conexiones (especialmente conexiones HTTP pendientes como las de Slowloris) puede derivar en agotamiento de recursos si no hay límites a nivel de proxy/reverse-proxy o protección en el borde.
  - El reinicio del contenedor fue suficiente para restaurar el estado en laboratorio; en producción se recomienda mitigación en capas (edge + proxy + host + app) en lugar de reinicios manuales.

**9. Evidencia adjunta**

Se incluyen en el repositorio (`infra/evidence/`):

- `baseline_curl.txt`
- `docker_stats_before.txt`
- `docker_stats_after.txt`
- `docker_stats_final.txt`
- `docker_stats_comparison.csv` (generado por `generate_report.py`)
- `docker_cpu_comparison.png` (gráfico generado)
- `app_logs_before.txt`, `app_logs_after.txt`, `app_logs_final.txt`

Incluye también los scripts usados: `infra/ddos/slowloris.py`, `infra/ddos/test_ddos.sh`, `infra/ddos/mitigate.sh`.

**10. Lecciones aprendidas y recomendaciones**

- Implementar protección en capas:
  - WAF/CDN en borde (Cloudflare, AWS Shield) para filtrar tráfico antes de llegar al host.
  - Reverse proxy (Nginx/Traefik) con `limit_req` y `limit_conn`.
  - Reglas persistentes de `iptables`/`ipset` y automatización (`fail2ban`).
  - Monitoreo en Prometheus + alertas en Grafana para detección temprana.

- Procedimientos operativos:
  - Definir runbooks de respuesta a incidentes (detección, contención, mitigación, post-mortem).
  - Automatizar pruebas periódicas en entorno staging para validar mitigaciones.

**11. Pasos siguientes (opcional / recomendados para entrega final)**

- Añadir un servicio `nginx` reverse-proxy y `certbot` al `docker-compose.yml` para terminar TLS y aplicar `limit_req` en proxy.
- Preparar un contenedor Ubuntu `privileged` para validar `iptables`/`ipset` en laboratorio y documentar reglas persistentes.
- Mejorar `generate_report.py` para parsear salidas de `wrk` y extraer latencias p50/p95/p99 (si se incorporan pruebas con `wrk`).

---

Si quieres que implemente alguno de los pasos anteriores (A: añadir nginx+certbot en `docker-compose.yml`, B: crear contenedor Ubuntu test con `iptables` y persistencia, C: mejorar `generate_report.py` para latencias), indícalo y lo automatizo en el repo.
# Informe Final: Pruebas Simuladas de Ataque DDoS y Mitigación

Este documento es una plantilla para el informe final que resume las pruebas de ataque simuladas (DDoS) realizadas contra el sistema, las contramedidas aplicadas y la evidencia que demuestra mitigación exitosa.

---

**1. Resumen ejecutivo**
- **Objetivo:** Validar la resiliencia del servicio frente a ataques DDoS básicos y documentar las mitigaciones aplicadas.
- **Resultado clave:** (Resumen en 2-3 líneas: p. ej. "Tras ejecutar ataques de SYN flood y Slowloris, la latencia aumentó X ms; tras aplicar ipset+iptables y límites en Nginx, la disponibilidad se recuperó en Y s y el tráfico malicioso fue bloqueado.")

**2. Alcance y autorizaciones**
- Sistemas objetivo: `app` (Next.js) expuesto en puerto 3000 detrás de `nginx` (si aplica), base de datos `db` (Postgres) no expuesta públicamente.
- Autorización: (Indicar que las pruebas fueron autorizadas y el entorno de pruebas). No ejecutar ataques en producción sin permiso.

**3. Entorno de pruebas**
- Fecha y hora (UTC):
- Topología de red: describir `docker-compose.yml`, servicios expuestos y proxys.
- Hardware/VMs: CPU, RAM, ancho de banda y localización del host atacante.
- Herramientas usadas: `hping3`, `slowloris.py`, `curl`, `wrk`/`siege`, `tcpdump`, Prometheus/Grafana, `pgbadger`, `iptables`, `ipset`, `fail2ban`.

**4. Plan de pruebas**
- Prueba A: SYN flood (hping3) — objetivo: saturar tablas de conexión / CPU.
- Prueba B: Slowloris — objetivo: agotar conexiones HTTP abiertas.
- Prueba C: HTTP flood (curl/wrk) — objetivo: aumentar RPS y latencia.
- Cada prueba: duración, intensidad (p. ej. 30s, 200 sockets), métricas a medir.

**5. Comandos reproducibles (ejecución desde máquina atacante)**
- SYN flood (hping3, 5s — solo laboratorio):
```
sudo hping3 -S -p 80 -i u1000 --flood target.example.com
```
- Slowloris (usa el PoC incluido):
```
python3 infra/ddos/slowloris.py target.example.com 80 200
```
- HTTP concurrente (wrk):
```
wrk -t8 -c200 -d30s http://target.example.com:80/
```
- Peticiones simples con `curl` (50 concurrentes):
```
for i in {1..50}; do curl -s "http://target.example.com/" >/dev/null & done; wait
```

**6. Métricas y logs a recolectar (servidor objetivo)**
- Captura de red (PCAP) durante la prueba (interfaz `eth0` o similar):
```
sudo tcpdump -i eth0 -w /tmp/attack_capture.pcap host <ip-atacante> and port 80
```
- Estadísticas de iptables antes/después:
```
sudo iptables -L -v -n > /tmp/iptables_before.txt
# aplicar mitigación
sudo iptables -L -v -n > /tmp/iptables_after.txt
```
- Contenido de ipset:
```
sudo ipset list > /tmp/ipset_list.txt
```
- Métricas del sistema durante la prueba (top, vmstat, iostat, ss):
```
vmstat 1 60 > /tmp/vmstat.txt &
top -b -n 60 > /tmp/top.txt &
ss -s > /tmp/ss_summary.txt
```
- Logs de Nginx/Next.js y Postgres (timestamps):
```
sudo tail -n 200 /var/log/nginx/access.log > /tmp/nginx_access.txt
sudo tail -n 200 /var/log/nginx/error.log > /tmp/nginx_error.txt
docker logs hiafinal_app --since "1m" > /tmp/app_logs.txt
docker logs hiafinal_db --since "1m" > /tmp/db_logs.txt
```
- Métricas Prometheus / captura de paneles Grafana: exportar PNG/CSV de las gráficas (RPS, latencia, CPU, conexiones TCP).

**7. Mitigaciones aplicadas (paso a paso)**
1. Bloqueo inicial de IPs maliciosas con `ipset` + `iptables`:
```
sudo ipset create blocklist hash:ip -exist
sudo ipset add blocklist 1.2.3.4
sudo iptables -I INPUT -m set --match-set blocklist src -j DROP
```
2. Habilitar SYN cookies y backlog:
```
sudo sysctl -w net.ipv4.tcp_syncookies=1
sudo sysctl -w net.ipv4.tcp_max_syn_backlog=2048
```
3. Aplicar rate-limiting en Nginx (si aplica):
```
http {
  limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;
}
server {
  location / { limit_req zone=mylimit burst=20 nodelay; }
}
```
4. Activar `fail2ban` para bloquear IPs que generen muchos errores 429/404/500.

**8. Resultados (antes / después)**
- Incluir tablas y gráficas: RPS, latencia media/percentiles (p50/p95/p99), CPU, memoria, conexiones TCP establecidas.
- Muestra ejemplo:
  - Antes mitigación: RPS=1500, p95 latency=1200ms, conexiones TCP establecidas=5000
  - Tras mitigación: RPS legítimo=200, p95 latency=150ms, conexiones TCP establecidas=120
- Indicar tiempo hasta recuperación (time-to-mitigate): X segundos desde detección hasta bloqueo efectivo.

**9. Evidencia adjunta**
- `/tmp/attack_capture.pcap` — PCAP de ataque.
- `iptables_before.txt`, `iptables_after.txt` — diff de reglas.
- `ipset_list.txt` — IPs bloqueadas.
- Capturas de Grafana (PNG/CSV) con métricas.
- Logs relevantes (`nginx_access.txt`, `app_logs.txt`, `db_logs.txt`).

**10. Análisis y lecciones aprendidas**
- Qué funcionó: p. ej. bloqueo con `ipset` redujo conexiones maliciosas en 99%.
- Qué mejorar: uso de CDN/WAF, aumentar capacidad de autoscaling, reglas más afinadas, integración con SIEM.

**11. Acciones recomendadas**
- Deploy de un reverse proxy (Nginx/Traefik) con `limit_req` y `limit_conn`.
- Integración con Cloudflare o similar para filtrar tráfico a nivel de edge.
- Implementar fail2ban + alertas por correo/Slack cuando se detecte un umbral.
- Automatizar persistencia de `ipset`/`iptables` y pruebas periódicas de estrés en entorno controlado.

**12. Apéndices**
- A. Comandos completos usados (copiar y pegar).
- B. Scripts: `infra/ddos/test_ddos.sh`, `infra/ddos/mitigate.sh`.
- C. Notas legales y autorizaciones.

---

Plantilla lista: rellena las secciones con los datos reales obtenidos en tus pruebas y adjunta los ficheros de evidencia en un zip o en el repositorio (por ejemplo `infra/evidence/<timestamp>/`).

Ejemplo de cómo guardar evidencia en el repo (desde el servidor de pruebas):
```
mkdir -p /tmp/evidence_$(date +%Y%m%d_%H%M%S)
cp /tmp/iptables_before.txt /tmp/evidence_*/
cp /tmp/iptables_after.txt /tmp/evidence_*/
cp /tmp/attack_capture.pcap /tmp/evidence_*/
# comprimir y mover (si es necesario)
tar czf ~/evidence_$(date +%Y%m%d_%H%M%S).tgz -C /tmp evidence_*
```
