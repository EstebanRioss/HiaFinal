Sistema de Alquiler de Canchas Deportivas

Documentación completa + Stack Tecnológico + Arquitectura + Docker + CI/CD

Sistema web desarrollado con Next.js, con gestión de canchas, reservas, calificaciones y roles de usuario (jugador, dueño, administrador).
Incluye documentación, arquitectura, contenedorización con Docker y pipeline CI/CD con GitHub Actions.

🧩 1. Identificación del Stack Tecnológico

Frontend / Fullstack
   Framework: Next.js 14 (App Router)
   Biblioteca UI: React 18
   Lenguaje: TypeScript
   Estilos: CSS global (globals.css) + componentes

Backend / API
   API Routes en /app/api/*
   Autenticación: JWT
   Hashing: bcryptjs
   IDs: uuid

Dependencias principales
   next
   react
   react-dom
   bcryptjs
   jsonwebtoken
   uuid

Persistencia
   Archivos JSON en /data:
      users.json
      courts.json
      reservations.json
      ratings.json

Infraestructura

   Docker (Dockerfile multi-stage)
   CI/CD: GitHub Actions

2. Arquitectura del Sistema

Cliente (Browser)
     ↓
Next.js — App Router
     ↓
API interna (app/api/*)
     ↓
Persistencia (JSON)

Componentes principales
   Frontend: páginas Next.js en /app
   API interna: módulos REST (/app/api/*)
   Autenticación: JWT + bcrypt
   Base de datos simulada: lectura/escritura de JSON
   Lógica de negocio: /lib
   CI/CD: GitHub Actions para build y test

Flujos principales
   Autenticación y roles
   Gestión de canchas
   Reservas
   Calificaciones
   Aprobación de canchas (admin)

3. Instalación del Proyecto

Instalar dependencias
   npm install

Modo desarrollo
   npm run dev

Abrir: http://localhost:3000

Build de producción
   npm run build
   npm start

4. Usuarios por defecto
Contraseña para todos: 123456
   Rol	   Email	               Función
   Admin	   admin@example.com    Aprueba solicitudes y gestiona canchas
   Dueño	   owner@example.com    Maneja sus canchas
   Jugador  player@example.com   Reserva y califica

5. Funcionalidades
Jugador
   Registro/login
   Ver canchas disponibles
   Filtrar por deporte o puntuación
   Realizar reservas
   Calificar canchas

Dueño
   Añadir su primera cancha
   Solicitar agregar más canchas
   Configurar horarios
   Ver calificaciones de sus canchas

Administrador
   Aprobar/rechazar solicitudes de dueños
   Crear canchas
   Ver todas las canchas

6. Reservas y horarios

Turnos de 1 hora
Dueño define rangos por día
Validación automática de disponibilidad
Después de completada → jugador puede calificar

7. Manual de Instalación de Docker (Windows + WSL2)

   1) Activar WSL2
      
   2) Instalar Docker Desktop
   Activar:
      “Use WSL2 based engine”
      “Ubuntu” en integración WSL
   3) Build y run
      docker build -t hiafinal .
      docker run -p 3000:3000 hiafinal
   Acceder: http://localhost:3000

8. Dockerfile del proyecto (explicación breve)

Etapa builder: instala dependencias y build Next.js
Etapa runner: imagen liviana node:18-alpine
Se copian solo los archivos necesarios para producción

9. CI/CD con GitHub Actions

Pipeline automático ante cualquier push a main.

✔ Instala dependencias
✔ Ejecuta build Next.js
✔ Construye contenedor Docker
✔ Valida que la app arranque
✔ Corre un curl de prueba
Workflow usado

   name: CI/CD - HIAFINAL

   on:
   push:
      branches: [ "main" ]
   pull_request:
      branches: [ "main" ]

   jobs:
   build-test-docker:
      runs-on: ubuntu-latest

      steps:
         - name: Checkout del código
         uses: actions/checkout@v4

         - name: Configurar Node 18
         uses: actions/setup-node@v4
         with:
            node-version: 18

         - name: Instalar dependencias
         run: npm ci

         - name: Verificar build de Next.js
         run: npm run build

         - name: Construir imagen Docker
         run: docker build -t hiafinal .

         - name: Probar contenedor
         run: |
            docker run -d -p 3000:3000 --name hiafinal hiafinal
            sleep 15
            curl -f http://localhost:3000 || (docker logs hiafinal && exit 1)

         - name: Limpiar contenedor
         if: always()
         run: |
            docker stop hiafinal || true
            docker rm hiafinal || true
11. Validación final del CI/CD
   Hacer un commit cualquiera
   Subir a main
   Verificar en GitHub → Actions que pase todo ✔
   CI/CD implementado correctamente

## 12. 📊 Carga de Datos Masivos para Pruebas de Optimización

### Descripción
El proyecto incluye un script para generar e insertar 860,000+ registros de prueba (usuarios, canchas, reservaciones, calificaciones) para realizar pruebas de optimización, análisis de performance y ejercicios con pgBadger.

### Contenidos
- **db/init/03_generate_bulk_data.sql** — Script SQL que genera datos masivos
- **db/load_bulk_data.sh** — Script bash para Linux/macOS
- **db/load_bulk_data.ps1** — Script PowerShell para Windows

### Cómo usar

#### **Opción 1: Windows (PowerShell)**
```powershell
cd "d:\HIA FINAL"

# Ejecutar el script
.\db\load_bulk_data.ps1

# Alternativamente, si prefieres usar docker compose directamente:
docker compose exec -T db psql -U postgres -d hia -f /docker-entrypoint-initdb.d/03_generate_bulk_data.sql
```

#### **Opción 2: Linux / macOS (bash)**
```bash
cd ~/hia-final  # o donde tengas el proyecto

# Dar permisos ejecutables (solo primera vez)
chmod +x db/load_bulk_data.sh

# Ejecutar el script
./db/load_bulk_data.sh
```

#### **Opción 3: Comando directo (cualquier SO)**
```bash
docker compose exec -T db psql -U postgres -d hia -f /docker-entrypoint-initdb.d/03_generate_bulk_data.sql
```

### Estadísticas de Carga
- **Usuarios**: ~500,000 (roles: player, owner, admin)
- **Canchas**: ~500,000 (deportes variados)
- **Reservaciones**: ~500,000
- **Calificaciones**: ~500,000
- **Total**: ~2,000,000 registros

**Duración esperada**: 5-15 minutos (depende del hardware)

### Funcionalidades del Script
✔ Desactiva triggers temporalmente para inserción rápida  
✔ Genera datos realistas (emails, fechas, precios aleatorios)  
✔ Crea índices estratégicos para optimización  
✔ Ejecuta ANALYZE para estadísticas actualizadas  
✔ Maneja conflictos de clave única  

### Análisis de Performance
Una vez cargados los datos, puedes analizar performance con pgBadger:

```bash
# Reiniciar pgBadger para análisis
docker compose restart pgbadger

# Ver reporte en navegador
# http://localhost/pgbadger_reports/report.html

# O generar reporte manual
docker compose exec pgbadger pgbadger -f postgres /var/lib/postgresql/data/log/postgresql.log -o /out/report.html
```

### Verificación
```bash
# Verificar cantidad de registros
docker compose exec db psql -U postgres -d hia -c "SELECT 
  (SELECT COUNT(*) FROM users) as usuarios,
  (SELECT COUNT(*) FROM courts) as canchas,
  (SELECT COUNT(*) FROM reservations) as reservaciones,
  (SELECT COUNT(*) FROM ratings) as calificaciones;"
```