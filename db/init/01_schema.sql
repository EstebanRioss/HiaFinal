CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE courts (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    sport TEXT NOT NULL,
    location TEXT NOT NULL,
    price_per_hour INTEGER NOT NULL,
    owner_id UUID REFERENCES users(id),
    description TEXT,
    average_rating NUMERIC,
    total_ratings INTEGER,
    created_at TIMESTAMP NOT NULL,
    availability JSONB NOT NULL
);

CREATE TABLE reservations (
    id UUID PRIMARY KEY,
    court_id UUID REFERENCES courts(id),
    user_id UUID REFERENCES users(id),
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    total_price INTEGER NOT NULL,
    payment_method TEXT,
    transfer_timing TEXT,
    status TEXT,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE ratings (
    id UUID PRIMARY KEY,
    court_id UUID REFERENCES courts(id),
    user_id UUID REFERENCES users(id),
    reservation_id UUID REFERENCES reservations(id),
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP NOT NULL
);