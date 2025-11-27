# ============================================================================
# Script para generar e insertar datos masivos en HIA FINAL (Windows)
# Uso: .\db\load_bulk_data.ps1
# ============================================================================

Write-Host "=================================================="
Write-Host "HIA FINAL - Cargador de Datos Masivos" -ForegroundColor Cyan
Write-Host "=================================================="
Write-Host ""

# Verificar si Docker está corriendo
try {
    $dockerVersion = docker version --format "{{.Server.Version}}" 2>$null
    if (-not $dockerVersion) {
        throw "Docker no está disponible"
    }
} catch {
    Write-Host "❌ Docker no está instalado, no está corriendo, o no está en el PATH" -ForegroundColor Red
    exit 1
}

Write-Host "📊 Iniciando carga de 860,000+ registros..." -ForegroundColor Yellow
Write-Host "⏱️  Esto puede tomar entre 2-10 minutos..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar script SQL dentro del contenedor PostgreSQL
try {
    docker compose exec -T db psql -U postgres -d hia -f /docker-entrypoint-initdb.d/03_generate_bulk_data.sql
    $exitCode = $LASTEXITCODE
} catch {
    $exitCode = $LASTEXITCODE
}

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "✅ Datos masivos cargados exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📈 Estadísticas:" -ForegroundColor Cyan
    Write-Host "   - Usuarios: ~500,000"
    Write-Host "   - Canchas: ~10,000"
    Write-Host "   - Reservaciones: ~250,000"
    Write-Host "   - Calificaciones: ~100,000"
    Write-Host ""
    Write-Host "📍 Ejecutar análisis con pgBadger:" -ForegroundColor Yellow
    Write-Host "   docker compose restart pgbadger"
    Write-Host ""
} else {
    Write-Host "❌ Error al cargar datos. Verifica que docker compose esté corriendo." -ForegroundColor Red
    Write-Host "Intenta manualmente:" -ForegroundColor Yellow
    Write-Host "   cd d:\HIA FINAL"
    Write-Host "   docker compose exec db psql -U postgres -d hia -f /docker-entrypoint-initdb.d/03_generate_bulk_data.sql"
    exit 1
}
