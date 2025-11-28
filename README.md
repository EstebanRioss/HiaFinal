# Sistema de Alquiler de Canchas Deportivas

**Alumnos**: Juan Garzon, Benjamin Cadena, Luca Andreu, Vladimir Cachi y Rios Esteban

**Documentación completa**: Stack Tecnológico + Arquitectura + Docker Compose + CI/CD + PostgreSQL + Monitoreo

## 📋 Descripción General

**HiaFinal** es una aplicación web moderna y escalable para gestionar alquiler de canchas deportivas. Permite que jugadores reserven canchas, dueños administren sus espacios, y administradores aprueben solicitudes.

**Características principales:**
- Autenticación segura (JWT + bcryptjs)
- Gestión de canchas con horarios dinámicos
- Sistema de reservas con validación de disponibilidad
- Calificaciones y puntuaciones
- Panel de administración
- Infraestructura containerizada (Docker Compose)
- CI/CD automatizado (GitHub Actions)
- Monitoreo en tiempo real (Prometheus + Grafana)
- Backups automáticos de BD

## 🧩 1. Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 (App Router, SSR/SSG)
- **Biblioteca UI**: React 18
- **Lenguaje**: TypeScript
- **Estilos**: CSS global + componentes

### Backend
- **Servidor**: Next.js API Routes (Node.js 18)
- **Autenticación**: JWT (jsonwebtoken)
- **Hashing**: bcryptjs
- **IDs**: uuid
- **Métricas**: prom-client (Prometheus)

### Base de Datos
- **Principal**: PostgreSQL 15
- **Tablas**: users, courts, reservations, ratings, court_requests, availability
- **Administración**: PgAdmin 4 (GUI)

### Infraestructura
- **Contenedorización**: Docker (Dockerfile multi-stage)
- **Orquestación**: Docker Compose (desarrollo + testing)
- **Servicios adicionales**:
  - Postgres 15 + volúmenes
  - PgAdmin (puerto 5050)
  - Prometheus (puerto 9090)
  - Grafana (puerto 3001)
  - Backups automáticos (pg_dump cada 24h)
  - pgbadger (análisis de logs)
  - GLPI + MariaDB (gestión de incidencias, opcional)

### CI/CD
- **Plataforma**: GitHub Actions
- **Workflow**: `.github/workflows/ci-cd.yml`
- **Pasos**: npm ci → npm run build → docker compose build/up → validaciones

### Dependencias Principales
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "uuid": "^9.0.1",
  "pg": "^8.16.3",
  "prom-client": "^15.1.3"
}
```

## 🏗️ 2. Arquitectura del Sistema

```
┌─────────────────────────┐
│   Browser / Cliente     │
│   React 18 + Next.js    │
└────────────┬────────────┘
             │ HTTP/HTTPS
             ▼
┌─────────────────────────────────┐
│  Next.js (SSR/SSG/ISR)         │
│  - Páginas: /app/*             │
│  - Componentes: /app/components│
└────────────┬────────────────────┘
             │
┌─────────────────────────────────┐
│  API Routes (/app/api/*)        │
│  - auth: login, register, me    │
│  - courts: CRUD, slots          │
│  - reservations: crear, listar  │
│  - ratings: crear, listar       │
│  - court-requests: aprobar      │
│  - metrics: Prometheus endpoint │
└────────────┬────────────────────┘
             │ SQL Queries
┌─────────────────────────────────┐
│  PostgreSQL 15                  │
│  - users (autenticación)        │
│  - courts (canchas)             │
│  - reservations (reservas)      │
│  - ratings (calificaciones)     │
│  - court_requests (solicitudes) │
│  - availability (horarios)      │
└─────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Servicios Docker Compose               │
├─────────────────────────────────────────┤
│ ✓ app (3000)        - Next.js app      │
│ ✓ db (5432)         - PostgreSQL 15    │
│ ✓ pgadmin (5050)    - Administración   │
│ ✓ prometheus (9090) - Métricas         │
│ ✓ grafana (3001)    - Dashboards       │
│ ✓ db_backup         - Backups 24h      │
│ ✓ pgbadger          - Análisis logs    │
│ ✓ glpi (8082)       - ITSM (opcional)  │
└─────────────────────────────────────────┘

┌──────────────────────────────────┐
│  GitHub Actions CI/CD            │
│  - npm ci / npm run build        │
│  - docker compose build/up       │
│  - Validaciones automáticas      │
└──────────────────────────────────┘
```

### Flujo de Datos Principal
1. Usuario accede a `http://localhost:3000`
2. Frontend (Next.js) renderiza componentes React
3. Usuario interactúa → llamadas a `/api/*`
4. API routes validan token JWT (en `lib/auth.ts`)
5. Consultas SQL a PostgreSQL (`lib/pg.ts`)
6. Respuestas JSON devueltas al cliente
7. Métricas registradas en Prometheus (`lib/metrics.js`)

## 🚀 3. Instalación y Configuración

### Prerequisitos
- Node.js 18+
- npm
- Docker + Docker Compose
- Git

### Instalación Local (Desarrollo)

**Opción A: Sin Docker (JSON)**
```bash
npm install
npm run dev
# Acceder a http://localhost:3000
```

**Opción B: Con Docker Compose (PostgreSQL)**
```bash
docker compose build
docker compose up -d

# Servicios disponibles:
# - App: http://localhost:3000
# - PgAdmin: http://localhost:5050 (admin@admin.com / admin)
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3001 (admin / admin)
# - GLPI: http://localhost:8082

# Ver logs:
docker compose logs -f app

# Parar servicios:
docker compose down
```

### Variables de Entorno (.env.local)
```env
DB_HOST=db
DB_PORT=5432
DB_NAME=hia
DB_USER=postgres
DB_PASS=postgres
DATABASE_URL=postgresql://postgres:postgres@db:5432/hia
JWT_SECRET=tu-secret-super-seguro-128-bits
NODE_ENV=development
```

## 👥 4. Usuarios por Defecto

| Rol | Email | Password | Función |
|-----|-------|----------|---------|
| Admin | admin@example.com | 123456 | Aprueba solicitudes, gestiona canchas |
| Dueño | owner@example.com | 123456 | Administra sus canchas, define horarios |
| Jugador | player@example.com | 123456 | Reserva canchas y califica |

**⚠️ Importante**: Cambiar contraseñas en producción.

## 📱 5. Funcionalidades Principales

### Para Jugadores
- Registrarse e iniciar sesión (JWT)
- Ver y filtrar canchas (por deporte, puntuación)
- Reservar turnos de 1 hora
- Método de pago flexible (transferencia, tarjeta, efectivo)
- Calificar canchas tras completar reserva
- Historial de reservas

### Para Dueños
- Agregar su primera cancha (directamente)
- Solicitar permiso para canchas adicionales
- Configurar horarios disponibles por día (múltiples rangos)
- Ver puntuación promedio de sus canchas
- Panel de gestión completo

### Para Administradores
- Aprobar/rechazar solicitudes de canchas
- Crear canchas directamente
- Gestionar usuarios y roles
- Ver todas las canchas del sistema
- Acceder a dashboards de monitoreo

## 📅 6. Reservas y Horarios

- **Duración**: Turnos de 1 hora (configurable)
- **Disponibilidad**: Dueño define rangos horarios por día de semana
- **Validación**: Sistema previene reservas solapadas
- **Calificación**: Jugador puede calificar tras completar la reserva
- **BD**: Tabla `reservations` con detección de conflictos usando SQL OVERLAPS

## 🐳 7. Docker Compose (Desarrollo + Testing)

### Servicios Incluidos

| Servicio | Puerto | Imagen | Propósito |
|----------|--------|--------|-----------|
| app | 3000 | Dockerfile local | Next.js app |
| db | 5432 | postgres:15 | Base de datos principal |
| pgadmin | 5050 | dpage/pgadmin4 | Gestión GUI de BD |
| prometheus | 9090 | prom/prometheus | Recolección de métricas |
| grafana | 3001 | grafana/grafana | Dashboards |
| db_backup | - | postgres:15 | Backups automáticos cada 24h |
| pgbadger | - | dalibo/pgbadger | Análisis de logs Postgres |
| glpi | 8082 | diouxx/glpi | Gestión de incidencias (opcional) |
| mariadb_glpi | 3307 | mariadb:10.6 | BD para GLPI |

### Comandos Principales

```bash
# Build y start
docker compose build
docker compose up -d

# Ver logs
docker compose logs -f app
docker compose logs db

# Ejecutar comando en contenedor
docker compose exec app npm run build
docker compose exec db psql -U postgres -d hia

# Parar y limpiar
docker compose down
docker compose down -v  # elimina volúmenes
```

## 📄 8. Dockerfile (Explicación)

### Etapa 1: Builder
```dockerfile
FROM node:18 as builder
WORKDIR /app
RUN apt-get update && apt-get install -y git  # Instala git para dependencias
COPY package.json package-lock.json ./
RUN npm ci                                     # Instala dependencias
COPY . .
RUN npm run build                              # Compila Next.js → .next/
```

### Etapa 2: Runner (Producción)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production                  # Solo dependencias runtime
COPY --from=builder /app/.next .next          # Copia compilado de builder
COPY public ./public                          # Assets estáticos
EXPOSE 3000
CMD ["npm", "start"]
```

### Ventajas de Multi-Stage
- ✅ Imagen final: ~280MB (sin deps dev)
- ✅ Build rápido con caché
- ✅ Seguridad: Código fuente no incluido
- ✅ Tiempo startup: ~2-3 segundos

## 9️⃣ 9. CI/CD con GitHub Actions

### Trigger
Cualquier **push a `main`** o **pull request a `main`** ejecuta automáticamente el pipeline.

### Pasos del Workflow

```yaml
name: CI/CD - HIAFINAL
on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]

jobs:
  build-test-docker:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout código
        uses: actions/checkout@v4

      - name: Setup Node 18
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Instalar dependencias
        run: npm ci

      - name: Docker Compose V2
        run: |
          mkdir -p /usr/local/lib/docker/cli-plugins
          curl -fsSL "https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64" \
            -o /usr/local/lib/docker/cli-plugins/docker-compose
          chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
          docker compose version

      - name: Crear directorios necesarios
        run: |
          mkdir -p db/init backups monitoring
          cat > monitoring/prometheus.yml <<EOF
          global:
            scrape_interval: 15s
          scrape_configs:
            - job_name: 'nextjs'
              static_configs:
                - targets: ['localhost:3000']
          EOF

      - name: Docker Compose build
        run: docker compose build

      - name: Docker Compose up
        run: docker compose up -d

      - name: Esperar Postgres
        run: |
          for i in {1..30}; do
            docker compose exec -T db pg_isready -U postgres && break
            echo "Esperando BD... ($i/30)"
            sleep 2
          done

      - name: Build Next.js completo
        run: npm run build

      - name: Validar app en 3000
        run: curl -f http://localhost:3000 || exit 1

      - name: Cleanup
        if: always()
        run: docker compose down -v
```

### Validaciones que Ocurren
✅ Instala dependencias npm  
✅ Compila TypeScript y Next.js  
✅ Construye todas las imágenes Docker  
✅ Inicia 9 servicios (app, db, prometheus, grafana, pgadmin, backups, pgbadger, glpi)  
✅ Valida que PostgreSQL inicie correctamente  
✅ Compila Next.js con todas las validaciones  
✅ Confirma que la app responde en puerto 3000  
✅ Limpia contenedores y volúmenes  

### Tiempo de Ejecución
- **Total**: ~3-4 minutos
- **Detalle**: Build (30s) + Docker build (1m) + Servicios (1m) + Validaciones (30s)

## 🔟 10. API Endpoints

### Autenticación

**POST /api/auth/register**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure123",
    "role": "player"
  }'
```
Respuesta: `{ "token": "eyJhbGc...", "user": { ... } }`

**POST /api/auth/login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure123"
  }'
```

**GET /api/auth/me** (Requiere JWT)
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer {token}"
```

### Canchas

**GET /api/courts** - Listar todas
```bash
curl http://localhost:3000/api/courts?sport=futbol&minRating=4
```

**POST /api/courts** - Crear (requiere dueño/admin)
```bash
curl -X POST http://localhost:3000/api/courts \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cancha Los Andes",
    "sport": "futbol",
    "price_per_hour": 50,
    "description": "Pasto sintético"
  }'
```

**GET /api/courts/[id]** - Detalle
```bash
curl http://localhost:3000/api/courts/abc123
```

**POST /api/courts/[id]/slots** - Agregar horarios
```bash
curl -X POST http://localhost:3000/api/courts/abc123/slots \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "day_of_week": "monday",
    "start_time": "09:00",
    "end_time": "18:00"
  }'
```

### Reservaciones

**POST /api/reservations** - Crear (con validación de conflictos)
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "court_id": "abc123",
    "start_time": "2024-02-15T10:00:00Z",
    "end_time": "2024-02-15T11:00:00Z",
    "payment_method": "transfer"
  }'
```
Respuesta: `{ "reservation_id": "uuid", "status": "confirmed" }`

**GET /api/reservations** - Mis reservaciones
```bash
curl http://localhost:3000/api/reservations \
  -H "Authorization: Bearer {token}"
```

### Calificaciones

**POST /api/ratings** - Calificar cancha
```bash
curl -X POST http://localhost:3000/api/ratings \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "court_id": "abc123",
    "rating": 5,
    "comment": "Excelente cancha, muy bien mantenida"
  }'
```

**GET /api/ratings** - Listar calificaciones
```bash
curl http://localhost:3000/api/ratings?court_id=abc123
```

### Solicitudes de Canchas

**POST /api/court-requests** - Solicitar nueva cancha (jugador)
```bash
curl -X POST http://localhost:3000/api/court-requests \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Nueva Cancha",
    "sport": "voley"
  }'
```

**POST /api/court-requests/[id]/approve** - Aprobar (admin)
```bash
curl -X POST http://localhost:3000/api/court-requests/req123/approve \
  -H "Authorization: Bearer {admin_token}"
```

**POST /api/court-requests/[id]/reject** - Rechazar (admin)
```bash
curl -X POST http://localhost:3000/api/court-requests/req123/reject \
  -H "Authorization: Bearer {admin_token}"
```

### Métricas (Prometheus)

**GET /api/metrics** - Endpoint Prometheus
```bash
curl http://localhost:3000/api/metrics
```
Respuesta: Métricas en formato Prometheus (http_requests_total, duration_ms, etc.)

## 1️⃣1️⃣ 11. Migración: JSON → PostgreSQL

### Estado Actual
- **Antes**: `/data/*.json` (users.json, courts.json, reservations.json, ratings.json)
- **Ahora**: PostgreSQL 15 con 6 tablas normalizadas

### Script de Migración
El proyecto incluye `scripts/json_to_sql.js` (referenciado en package.json):
```bash
npm run db:migrate
```

### Tablas PostgreSQL

| Tabla | Propósito | Columnas Principales |
|-------|-----------|---------------------|
| `users` | Autenticación | id, email, password_hash, role, created_at |
| `courts` | Canchas deportivas | id, name, sport, price_per_hour, owner_id, rating |
| `reservations` | Reservas de turnos | id, court_id, user_id, start_time, end_time, payment_method |
| `ratings` | Calificaciones | id, court_id, user_id, rating, comment, created_at |
| `court_requests` | Solicitudes de canchas | id, user_id, name, sport, status, created_at |
| `availability` | Horarios disponibles | id, court_id, day_of_week, start_time, end_time |

### Ventajas PostgreSQL
✅ Transacciones ACID para reservaciones  
✅ Validación de conflictos con SQL OVERLAPS  
✅ Índices para queries rápidas  
✅ Respaldo automático cada 24h  
✅ Escala a millones de registros  

## 1️⃣2️⃣ 12. Verificación Final y Próximos Pasos

### Checklist de Validación
```bash
# 1. Verificar todos los servicios están running
docker compose ps

# 2. Probar conectividad a bases de datos
docker compose exec db psql -U postgres -d hia -c "SELECT COUNT(*) FROM users;"

# 3. Verificar app en browser
open http://localhost:3000

# 4. Verificar métricas Prometheus
open http://localhost:9090

# 5. Verificar dashboards Grafana
open http://localhost:3001  # admin/admin

# 6. Ejecutar tests (opcional)
npm run test

# 7. Build final para producción
docker build -t hiafinal:latest .
```

### Próximos Pasos Recomendados
1. **Carga de datos masivos**: Ejecutar `scripts/json_to_sql.js` para migración
2. **Hardening seguridad**:
   - Cambiar contraseñas por defecto en producción
   - Configurar TLS/SSL
   - Habilitar autenticación en PgAdmin
3. **Publicar imagen Docker**:
   ```bash
   docker tag hiafinal:latest myregistry/hiafinal:latest
   docker push myregistry/hiafinal:latest
   ```
4. **Monitoreo en producción**:
   - Alertas Prometheus para métricas críticas
   - Logs centralizados (ELK, Datadog, etc.)
   - Backups verificados regularmente
5. **Testing**:
   - Pruebas de carga con Apache JMeter
   - Análisis de performance con pgBadger
   - Tests de integración con Jest

### Contribuyentes
- Juan Garzon
- Benjamin Cadena
- Luca Andreu
- Vladimir Cachi
- Rios Esteban

### Licencia
MIT

---

**Última actualización**: 2024
**Estado**: ✅ Producción-ready con Docker Compose + CI/CD