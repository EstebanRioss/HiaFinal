-- USERS
INSERT INTO users (id, email, password, name, role, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@example.com', '$2a$10$MCXiUAD1wiqT5ejT7XD/a.xDn4TP2aUUH.7hkMj0a9QPUaj4EHjcC', 'Administrador', 'admin', '2025-11-10T18:24:58.969Z'),
('22222222-2222-2222-2222-222222222222', 'owner@example.com', '$2a$10$9mKtE.nXYlCzniLUmAhp5.sBGZyP1TqTFSkf37VdQHFsS/osMefDq', 'Dueño de Cancha', 'owner', '2025-11-10T18:24:58.969Z'),
('33333333-3333-3333-3333-333333333333', 'player@example.com', '$2a$10$fzec0YjRZ5DmP1GT1hyNve1COvgUl65PEenYPjkuRfh1Tsmcw3bGe', 'Jugador', 'player', '2025-11-10T18:24:58.969Z'),
('4233ab81-0d4c-4551-83bf-8c169a38a305', 'cupuepentapa2@gmail.com', '$2a$10$q2oR3jy0lZWObZjXIJJymOeHXcq7Ymssf2amAP8bn4aaVF5HhADYq', 'Vladimir', 'player', '2025-11-10T18:27:52.464Z'),
('af91a3a2-4b0b-4baf-9fec-e389ad93ef20', 'cachi@gmail.com', '$2a$10$gUnizxq27jCyH5HG20kMNeSKEpRoJC0iEqyFp/UKhQvxC8jMRxDI2', 'vladimir', 'player', '2025-11-10T21:19:55.741Z');



-- COURT
INSERT INTO courts (
    id, name, sport, location, price_per_hour, owner_id,
    description, average_rating, total_ratings, created_at, availability
) VALUES (
    '9b0768a2-257e-455c-ad4e-a16fb491ed6e',
    'Granaderos',
    'futbol',
    'Julio Sanchez',
    26000,
    '22222222-2222-2222-2222-222222222222',
    'Cancha de futbol 7 (Mínimo 5 jugadores por equipo)',
    5,
    1,
    '2025-11-10T19:38:00.599Z',
    '[
      {"dayOfWeek":"lunes","ranges":[{"startTime":"10:00","endTime":"22:00"}]},
      {"dayOfWeek":"martes","ranges":[{"startTime":"10:00","endTime":"22:00"}]},
      {"dayOfWeek":"miercoles","ranges":[{"startTime":"10:00","endTime":"22:00"}]},
      {"dayOfWeek":"jueves","ranges":[{"startTime":"10:00","endTime":"22:00"}]},
      {"dayOfWeek":"viernes","ranges":[{"startTime":"10:00","endTime":"22:00"}]},
      {"dayOfWeek":"sabado","ranges":[{"startTime":"10:00","endTime":"22:00"}]},
      {"dayOfWeek":"domingo","ranges":[{"startTime":"10:00","endTime":"22:00"}]}
    ]'::jsonb
);



-- RESERVATION
INSERT INTO reservations (
    id, court_id, user_id, date,
    start_time, end_time, total_price,
    payment_method, transfer_timing, status, created_at
) VALUES (
    '3baa06be-fc69-4ecd-9738-13534c57a172',
    '9b0768a2-257e-455c-ad4e-a16fb491ed6e',
    '33333333-3333-3333-3333-333333333333',
    '2025-11-19',
    '18:00',
    '19:00',
    26000,
    'transferencia',
    'inmediato',
    'completed',
    '2025-11-18T14:58:41.635Z'
);



-- RATING
INSERT INTO ratings (
    id, court_id, user_id, reservation_id,
    rating, comment, created_at
) VALUES (
    '1f61a960-266f-445f-a456-630dfa6779d1',
    '9b0768a2-257e-455c-ad4e-a16fb491ed6e',
    '33333333-3333-3333-3333-333333333333',
    '3baa06be-fc69-4ecd-9738-13534c57a172',
    5,
    '',
    '2025-11-18T14:59:12.297Z'
);