#!/bin/bash
# ============================================================================
# Script para generar e insertar datos masivos en HIA FINAL
# Uso: ./db/load_bulk_data.sh
# ============================================================================

set -e

echo "=================================================="
echo "HIA FINAL - Cargador de Datos Masivos"
echo "=================================================="
echo ""

# Verificar si Docker está corriendo
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado o no está en el PATH"
    exit 1
fi

echo "📊 Iniciando carga de 860,000+ registros..."
echo "⏱️  Esto puede tomar entre 2-10 minutos..."
echo ""

# Ejecutar script SQL dentro del contenedor PostgreSQL
docker compose exec -T db psql -U postgres -d hia -f /docker-entrypoint-initdb.d/03_generate_bulk_data.sql

echo ""
echo "✅ Datos masivos cargados exitosamente!"
echo ""
echo "📈 Estadísticas:"
echo "   - Usuarios: ~500,000"
echo "   - Canchas: ~10,000"
echo "   - Reservaciones: ~250,000"
echo "   - Calificaciones: ~100,000"
echo ""
echo "📍 Ejecutar análisis con pgBadger:"
echo "   docker compose restart pgbadger"
echo ""
