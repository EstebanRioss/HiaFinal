# Sistema de Alquiler de Canchas Deportivas

Sistema web para alquiler de canchas de distintos deportes con sistema de pago, autenticación por roles y sistema de puntuación.

## Características

- 🔐 Sistema de autenticación con tres roles: Administrador, Dueño de Cancha y Jugador
- 🏀 Filtro por deporte para buscar canchas
- ⭐ Sistema de puntuación de canchas
- 📊 Filtro por puntuación (mejores a peores)
- 💳 Sistema de pago (Transferencia, Tarjeta, Efectivo)
- 📅 Sistema de reservas
- 👨‍💼 Panel de administración para gestionar canchas
- 🕒 Turnos de 1 hora con disponibilidad definida por cada dueño

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Usuarios por Defecto

El sistema incluye tres usuarios de ejemplo (todos con contraseña: `123456`):

- **Administrador**: `admin@example.com` - Acceso al panel de administración
- **Dueño de Cancha**: `owner@example.com` - Puede ver sus canchas
- **Jugador**: `player@example.com` - Puede hacer reservas y calificar canchas

## Funcionalidades Principales

### Para Jugadores:
- Registrarse e iniciar sesión
- Buscar canchas por deporte
- Filtrar canchas por puntuación
- Reservar canchas con diferentes métodos de pago
- Calificar canchas después de completar una reserva

### Para Dueños de Cancha:
- Agregar su primera cancha directamente
- Solicitar permiso al administrador para agregar más canchas
- Ver sus canchas registradas
- Ver el estado de sus solicitudes
- Ver estadísticas de puntuación
- Configurar horarios disponibles por día y por rango

### Para Administradores:
- Agregar nuevas canchas al sistema
- Ver y gestionar solicitudes de canchas de los dueños
- Aprobar o rechazar solicitudes de canchas
- Ver todas las canchas registradas
- Gestionar usuarios

## Estructura del Proyecto

- `/app` - Páginas y rutas de Next.js
- `/lib` - Utilidades y funciones auxiliares
- `/types` - Definiciones de tipos TypeScript
- `/data` - Base de datos JSON (se crea automáticamente)

## Sistema de Solicitudes de Canchas

Los dueños de canchas tienen un sistema especial para agregar canchas:

1. **Primera Cancha**: Los dueños pueden agregar su primera cancha directamente sin necesidad de aprobación.

2. **Canchas Adicionales**: Para agregar más canchas, los dueños deben:
   - Solicitar permiso al administrador desde su panel
   - El administrador revisa la solicitud
   - El administrador puede aprobar (crea la cancha automáticamente) o rechazar la solicitud

## Horarios y Reservas

- Cada turno dura exactamente **1 hora** y se elige a partir de los rangos definidos por el dueño.
- Los dueños pueden cargar múltiples bloques por día (ej. 10:00‑13:00 y 17:00‑23:00).
- Solo usuarios autenticados como **jugadores** o **dueños** pueden reservar.
- El sistema valida que el horario seleccionado esté disponible y no reservado previamente.

## Notas

- El sistema usa archivos JSON para almacenar datos (simulación de base de datos)
- Las contraseñas se almacenan hasheadas usando bcrypt
- El sistema de pago es simulado (no realiza transacciones reales)
- Las reservas se marcan como "completadas" automáticamente para permitir calificaciones
- Los dueños solo pueden agregar una cancha directamente; las adicionales requieren aprobación del administrador

