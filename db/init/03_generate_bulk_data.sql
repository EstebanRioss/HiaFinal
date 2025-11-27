-- ============================================================================
-- Script de Generación de Datos Masivos para HIA FINAL
-- Genera 500,000+ registros por tabla para pruebas de optimización y performance
-- ============================================================================

-- Desactivar checks de FK temporalmente para inserción rápida
ALTER TABLE reservations DISABLE TRIGGER ALL;
ALTER TABLE ratings DISABLE TRIGGER ALL;

-- ============================================================================
-- 1. GENERAR USUARIOS (500,000)
-- ============================================================================
INSERT INTO users (id, email, password, name, role, created_at)
SELECT
    gen_random_uuid(),
    'user_' || i::text || '@example.com',
    '$2a$10$W1gxg8nE1uS.spiMD1PE6eW67M.oPjEfJlwI2OX4kjUs.S3w6jACC', -- hash bcrypt de "123456"
    'Usuario ' || i::text,
    CASE WHEN i % 3 = 0 THEN 'owner'
         WHEN i % 3 = 1 THEN 'player'
         ELSE 'admin' END,
    NOW() - (random() * interval '365 days')
FROM generate_series(1, 500000) as t(i)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. GENERAR CANCHAS (500,000)
-- ============================================================================
INSERT INTO courts (id, name, location, sport, availability, owner_id, price_per_hour, average_rating, total_ratings, created_at)
SELECT
    gen_random_uuid(),
    'Cancha ' || i::text || ' - ' || CASE (i % 5)
        WHEN 0 THEN 'Fútbol'
        WHEN 1 THEN 'Tenis'
        WHEN 2 THEN 'Básquetbol'
        WHEN 3 THEN 'Vóley'
        ELSE 'Paddle' END,
    'Ubicación ' || i::text,
    CASE (i % 5)
        WHEN 0 THEN 'Fútbol'
        WHEN 1 THEN 'Tenis'
        WHEN 2 THEN 'Básquetbol'
        WHEN 3 THEN 'Vóley'
        ELSE 'Paddle' END,
    '{"Mon": "09:00-21:00", "Tue": "09:00-21:00", "Wed": "09:00-21:00", "Thu": "09:00-21:00", "Fri": "09:00-21:00", "Sat": "09:00-23:00", "Sun": "09:00-23:00"}'::jsonb,
    (SELECT id FROM users WHERE role = 'owner' ORDER BY random() LIMIT 1),
    (100 + (random() * 200)::int),
    (3.5 + (random() * 1.5)),
    (random() * 500)::int,
    NOW() - (random() * interval '365 days')
FROM generate_series(1, 500000) as t(i)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. GENERAR RESERVACIONES (500,000)
-- ============================================================================
INSERT INTO reservations (id, court_id, user_id, date, start_time, end_time, total_price, payment_method, transfer_timing, status, created_at)
SELECT
    gen_random_uuid(),
    (SELECT id FROM courts ORDER BY random() LIMIT 1),
    (SELECT id FROM users WHERE role = 'player' ORDER BY random() LIMIT 1),
    CURRENT_DATE + (random() * 90)::int,
    ((random() * 20)::int || ':00:00'),
    (((random() * 20)::int + 1) || ':00:00'),
    (150 + (random() * 250)::int),
    CASE WHEN random() < 0.7 THEN 'cash' ELSE 'transfer' END,
    CASE WHEN random() < 0.5 THEN 'immediate' ELSE 'later' END,
    'completed',
    NOW() - (random() * interval '180 days')
FROM generate_series(1, 500000) as t(i)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. GENERAR CALIFICACIONES (500,000)
-- ============================================================================
INSERT INTO ratings (id, court_id, user_id, reservation_id, rating, comment, created_at)
SELECT
    gen_random_uuid(),
    (SELECT id FROM courts ORDER BY random() LIMIT 1),
    (SELECT id FROM users WHERE role = 'player' ORDER BY random() LIMIT 1),
    (SELECT id FROM reservations ORDER BY random() LIMIT 1),
    (3 + (random() * 2)::int),
    'Comentario de prueba ' || i::text || ' - ' ||
    CASE WHEN random() < 0.7 THEN 'Excelente cancha, muy bien mantenida'
         WHEN random() < 0.8 THEN 'Buena experiencia, recomendado'
         ELSE 'Cancha decente, podría mejorar' END,
    NOW() - (random() * interval '180 days')
FROM generate_series(1, 500000) as t(i)
ON CONFLICT DO NOTHING;

-- Reactivar triggers
ALTER TABLE reservations ENABLE TRIGGER ALL;
ALTER TABLE ratings ENABLE TRIGGER ALL;

-- ============================================================================
-- 5. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_courts_sport ON courts(sport);
CREATE INDEX IF NOT EXISTS idx_courts_owner_id ON courts(owner_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_court_id ON reservations(court_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_ratings_court_id ON ratings(court_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_reservation_id ON ratings(reservation_id);

-- ============================================================================
-- 6. ACTUALIZAR ESTADÍSTICAS DE TABLAS
-- ============================================================================
ANALYZE users;
ANALYZE courts;
ANALYZE reservations;
ANALYZE ratings;

-- ============================================================================
-- Información de carga
-- ============================================================================
-- Este script inserta aproximadamente:
-- - 500,000 usuarios
-- - 500,000 canchas
-- - 500,000 reservaciones
-- - 500,000 calificaciones
-- Total: ~2,000,000 registros
--
-- Duración esperada: 5-15 minutos dependiendo del hardware
-- ============================================================================
