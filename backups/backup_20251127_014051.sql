--
-- PostgreSQL database dump
--

\restrict CZYPBy9NxsVkG8gbrKeMZOFXGybrpakRYDJXII7yB9iZYGcCNG0NMQ7n7ezlYwa

-- Dumped from database version 15.15 (Debian 15.15-1.pgdg13+1)
-- Dumped by pg_dump version 15.15 (Debian 15.15-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: courts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courts (
    id uuid NOT NULL,
    name text NOT NULL,
    sport text NOT NULL,
    location text NOT NULL,
    price_per_hour integer NOT NULL,
    owner_id uuid,
    description text,
    average_rating numeric,
    total_ratings integer,
    created_at timestamp without time zone NOT NULL,
    availability jsonb NOT NULL
);


ALTER TABLE public.courts OWNER TO postgres;

--
-- Name: ratings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ratings (
    id uuid NOT NULL,
    court_id uuid,
    user_id uuid,
    reservation_id uuid,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.ratings OWNER TO postgres;

--
-- Name: reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservations (
    id uuid NOT NULL,
    court_id uuid,
    user_id uuid,
    date date NOT NULL,
    start_time text NOT NULL,
    end_time text NOT NULL,
    total_price integer NOT NULL,
    payment_method text,
    transfer_timing text,
    status text,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.reservations OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: courts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courts (id, name, sport, location, price_per_hour, owner_id, description, average_rating, total_ratings, created_at, availability) FROM stdin;
9b0768a2-257e-455c-ad4e-a16fb491ed6e	Granaderos	futbol	Julio Sanchez	26000	22222222-2222-2222-2222-222222222222	Cancha de futbol 7 (Mínimo 5 jugadores por equipo)	5	1	2025-11-10 19:38:00.599	[{"ranges": [{"endTime": "22:00", "startTime": "10:00"}], "dayOfWeek": "lunes"}, {"ranges": [{"endTime": "22:00", "startTime": "10:00"}], "dayOfWeek": "martes"}, {"ranges": [{"endTime": "22:00", "startTime": "10:00"}], "dayOfWeek": "miercoles"}, {"ranges": [{"endTime": "22:00", "startTime": "10:00"}], "dayOfWeek": "jueves"}, {"ranges": [{"endTime": "22:00", "startTime": "10:00"}], "dayOfWeek": "viernes"}, {"ranges": [{"endTime": "22:00", "startTime": "10:00"}], "dayOfWeek": "sabado"}, {"ranges": [{"endTime": "22:00", "startTime": "10:00"}], "dayOfWeek": "domingo"}]
\.


--
-- Data for Name: ratings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ratings (id, court_id, user_id, reservation_id, rating, comment, created_at) FROM stdin;
1f61a960-266f-445f-a456-630dfa6779d1	9b0768a2-257e-455c-ad4e-a16fb491ed6e	33333333-3333-3333-3333-333333333333	3baa06be-fc69-4ecd-9738-13534c57a172	5		2025-11-18 14:59:12.297
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservations (id, court_id, user_id, date, start_time, end_time, total_price, payment_method, transfer_timing, status, created_at) FROM stdin;
3baa06be-fc69-4ecd-9738-13534c57a172	9b0768a2-257e-455c-ad4e-a16fb491ed6e	33333333-3333-3333-3333-333333333333	2025-11-19	18:00	19:00	26000	transferencia	inmediato	completed	2025-11-18 14:58:41.635
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, name, role, created_at) FROM stdin;
11111111-1111-1111-1111-111111111111	admin@example.com	$2a$10$MCXiUAD1wiqT5ejT7XD/a.xDn4TP2aUUH.7hkMj0a9QPUaj4EHjcC	Administrador	admin	2025-11-10 18:24:58.969
22222222-2222-2222-2222-222222222222	owner@example.com	$2a$10$9mKtE.nXYlCzniLUmAhp5.sBGZyP1TqTFSkf37VdQHFsS/osMefDq	Dueño de Cancha	owner	2025-11-10 18:24:58.969
33333333-3333-3333-3333-333333333333	player@example.com	$2a$10$fzec0YjRZ5DmP1GT1hyNve1COvgUl65PEenYPjkuRfh1Tsmcw3bGe	Jugador	player	2025-11-10 18:24:58.969
4233ab81-0d4c-4551-83bf-8c169a38a305	cupuepentapa2@gmail.com	$2a$10$q2oR3jy0lZWObZjXIJJymOeHXcq7Ymssf2amAP8bn4aaVF5HhADYq	Vladimir	player	2025-11-10 18:27:52.464
af91a3a2-4b0b-4baf-9fec-e389ad93ef20	cachi@gmail.com	$2a$10$gUnizxq27jCyH5HG20kMNeSKEpRoJC0iEqyFp/UKhQvxC8jMRxDI2	vladimir	player	2025-11-10 21:19:55.741
\.


--
-- Name: courts courts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courts
    ADD CONSTRAINT courts_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: courts courts_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courts
    ADD CONSTRAINT courts_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: ratings ratings_court_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_court_id_fkey FOREIGN KEY (court_id) REFERENCES public.courts(id);


--
-- Name: ratings ratings_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(id);


--
-- Name: ratings ratings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: reservations reservations_court_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_court_id_fkey FOREIGN KEY (court_id) REFERENCES public.courts(id);


--
-- Name: reservations reservations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict CZYPBy9NxsVkG8gbrKeMZOFXGybrpakRYDJXII7yB9iZYGcCNG0NMQ7n7ezlYwa

