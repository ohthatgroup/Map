-- Trip Planner Database Schema for Neon PostgreSQL

-- Create trips table for organizing multiple trips
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trip_days table for daily organization
CREATE TABLE trip_days (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    date DATE NOT NULL,
    color VARCHAR(7) DEFAULT '#FF6B6B', -- Hex color code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trip_id, day_number)
);

-- Create stops table for individual locations
CREATE TABLE stops (
    id SERIAL PRIMARY KEY,
    trip_day_id INTEGER REFERENCES trip_days(id) ON DELETE CASCADE,
    stop_number INTEGER NOT NULL,
    name VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_trip_days_trip_id ON trip_days(trip_id);
CREATE INDEX idx_trip_days_date ON trip_days(date);
CREATE INDEX idx_stops_trip_day_id ON stops(trip_day_id);
CREATE INDEX idx_stops_coordinates ON stops(latitude, longitude);

-- Insert sample data (New England Fall trip)
INSERT INTO trips (name, description, start_date, end_date)
VALUES ('New England Fall', 'Beautiful autumn journey through New England states', '2025-10-03', '2025-10-15');

-- Get the trip_id for the inserted trip
WITH trip_data AS (
    SELECT id FROM trips WHERE name = 'New England Fall'
)
INSERT INTO trip_days (trip_id, day_number, date, color)
SELECT
    t.id,
    d.day_number,
    d.date,
    d.color
FROM trip_data t,
(VALUES
    (1, '2025-10-03', '#FF6B6B'),
    (2, '2025-10-04', '#4ECDC4'),
    (3, '2025-10-05', '#45B7D1'),
    (4, '2025-10-06', '#96CEB4'),
    (5, '2025-10-07', '#FFEAA7'),
    (6, '2025-10-08', '#DFE6E9'),
    (7, '2025-10-09', '#74B9FF'),
    (8, '2025-10-10', '#A29BFE'),
    (9, '2025-10-11', '#FD79A8'),
    (10, '2025-10-12', '#FDCB6E'),
    (11, '2025-10-13', '#6C5CE7'),
    (12, '2025-10-14', '#00B894'),
    (13, '2025-10-15', '#FF7675')
) AS d(day_number, date, color);

-- Insert sample stops
WITH day_data AS (
    SELECT td.id as trip_day_id, td.day_number
    FROM trips t
    JOIN trip_days td ON t.id = td.trip_id
    WHERE t.name = 'New England Fall'
)
INSERT INTO stops (trip_day_id, stop_number, name, latitude, longitude, notes)
SELECT
    dd.trip_day_id,
    s.stop_number,
    s.name,
    s.latitude,
    s.longitude,
    s.notes
FROM day_data dd
JOIN (VALUES
    -- Day 1
    (1, 1, '585 E 21st St, Brooklyn NY', 40.6089, -73.9570, 'Trip starting point - early morning departure'),
    (1, 2, '1349 Main Road, Granville MA', 42.0653, -72.8620, 'First destination - afternoon arrival'),
    -- Day 2
    (2, 1, '218 Streeter Rd, Dorchester NH', 43.7534, -71.9723, 'Mountain views and hiking trails'),
    -- Day 3
    (3, 1, '134 Burnett Road, Freeport ME', 43.8570, -70.1028, 'Coastal Maine - LL Bean headquarters'),
    -- Day 4
    (4, 1, '553 Wiscasset Road, Boothbay ME', 43.8767, -69.6281, 'Boothbay Harbor - lobster dinner'),
    -- Day 5
    (5, 1, 'Farview Dr, Winter Harbor ME', 44.3932, -68.0864, 'Acadia National Park area'),
    -- Day 6
    (6, 1, 'Camden, Maine', 44.2098, -69.0648, 'Picturesque harbor town'),
    -- Day 7
    (7, 1, 'Portland, Maine', 43.6230, -70.2077, 'Food scene and Old Port district'),
    -- Day 8
    (8, 1, 'Salem, Massachusetts', 42.5195, -70.8967, 'Witch trials history and museums'),
    -- Day 9
    (9, 1, 'Salem, Massachusetts', 42.5195, -70.8967, 'Extended stay - more exploration'),
    -- Day 10
    (10, 1, 'Cape Cod, Massachusetts', 42.0533, -70.1710, 'Beach relaxation and seafood'),
    -- Day 11
    (11, 1, 'Newport, Rhode Island', 41.4901, -71.3128, 'Mansions tour and cliff walk'),
    -- Day 12
    (12, 1, 'Mystic, Connecticut', 41.3612, -71.9662, 'Mystic Seaport and aquarium'),
    -- Day 13
    (13, 1, '585 E 21st St, Brooklyn NY', 40.6089, -73.9570, 'Return home - end of amazing trip')
) AS s(day_number, stop_number, name, latitude, longitude, notes)
ON dd.day_number = s.day_number;

-- Create a view for easy data retrieval
CREATE VIEW trip_data_view AS
SELECT
    t.id as trip_id,
    t.name as trip_name,
    t.description as trip_description,
    td.day_number,
    td.date,
    td.color,
    s.stop_number,
    s.name as location,
    s.latitude,
    s.longitude,
    s.notes,
    s.id as stop_id
FROM trips t
JOIN trip_days td ON t.id = td.trip_id
JOIN stops s ON td.id = s.trip_day_id
ORDER BY t.id, td.day_number, s.stop_number;