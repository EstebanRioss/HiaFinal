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