import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    await client.connect();

    const schema = `
      CREATE TABLE IF NOT EXISTS trips (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS trip_days (
        id SERIAL PRIMARY KEY,
        trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
        day_number INTEGER NOT NULL,
        date DATE,
        color VARCHAR(7) DEFAULT '#3388ff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(trip_id, day_number)
      );

      CREATE TABLE IF NOT EXISTS stops (
        id SERIAL PRIMARY KEY,
        trip_day_id INTEGER REFERENCES trip_days(id) ON DELETE CASCADE,
        stop_number INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE OR REPLACE VIEW trip_data_view AS
      SELECT
        t.id as trip_id,
        t.name as trip_name,
        td.day_number,
        td.date,
        td.color,
        s.id as stop_id,
        s.stop_number,
        s.name as location,
        s.latitude,
        s.longitude,
        s.notes
      FROM trips t
      JOIN trip_days td ON t.id = td.trip_id
      JOIN stops s ON td.id = s.trip_day_id
      ORDER BY t.id, td.day_number, s.stop_number;

      INSERT INTO trips (id, name, description) VALUES (1, 'New England Adventure', 'A wonderful trip through New England states')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO trip_days (trip_id, day_number, date, color) VALUES
        (1, 1, '2024-09-15', '#ff6b6b'),
        (1, 2, '2024-09-16', '#4ecdc4'),
        (1, 3, '2024-09-17', '#45b7d1'),
        (1, 4, '2024-09-18', '#96ceb4'),
        (1, 5, '2024-09-19', '#ffeaa7'),
        (1, 6, '2024-09-20', '#dda0dd'),
        (1, 7, '2024-09-21', '#98d8c8'),
        (1, 8, '2024-09-22', '#f7dc6f'),
        (1, 9, '2024-09-23', '#bb8fce'),
        (1, 10, '2024-09-24', '#85c1e9'),
        (1, 11, '2024-09-25', '#f8c471'),
        (1, 12, '2024-09-26', '#82e0aa'),
        (1, 13, '2024-09-27', '#f1948a')
      ON CONFLICT (trip_id, day_number) DO NOTHING;

      INSERT INTO stops (trip_day_id, stop_number, name, latitude, longitude, notes) VALUES
        ((SELECT id FROM trip_days WHERE trip_id = 1 AND day_number = 1), 1, 'Boston Common', 42.3551, -71.0656, 'Historic park in downtown Boston'),
        ((SELECT id FROM trip_days WHERE trip_id = 1 AND day_number = 2), 1, 'Freedom Trail', 42.3598, -71.0574, 'Walking trail through historic sites'),
        ((SELECT id FROM trip_days WHERE trip_id = 1 AND day_number = 3), 1, 'Harvard University', 42.3770, -71.1167, 'Famous university campus'),
        ((SELECT id FROM trip_days WHERE trip_id = 1 AND day_number = 4), 1, 'Cape Cod', 41.6688, -70.2962, 'Beautiful coastal area'),
        ((SELECT id FROM trip_days WHERE trip_id = 1 AND day_number = 5), 1, 'Mystic Seaport', 41.3712, -71.9662, 'Maritime museum in Connecticut'),
        ((SELECT id FROM trip_days WHERE trip_id = 1 AND day_number = 6), 1, 'Acadia National Park', 44.3386, -68.2733, 'Stunning national park in Maine'),
        ((SELECT id FROM trip_days WHERE trip_id = 1 AND day_number = 7), 1, 'White Mountains', 44.2619, -71.3015, 'Beautiful mountain range in New Hampshire'),
        ((SELECT id FROM trip_days WHERE trip_id = 1 AND day_number = 8), 1, 'Stowe', 44.4654, -72.6874, 'Charming Vermont town'),
        ((SELECT id FROM trip_days WHERE trip_id = 1 AND day_number = 9), 1, 'Lake Champlain', 44.0979, -73.3544, 'Large lake between Vermont and New York'),
        ((SELECT id FROM trip_days WHERE trip_id = 1 AND day_number = 10), 1, 'Newport Mansions', 41.4901, -71.3128, 'Historic mansions in Rhode Island'),
        ((SELECT id FROM trip_days WHERE trip_id = 1 AND day_number = 11), 1, 'Mohawk Trail', 42.6028, -72.9481, 'Scenic drive through Massachusetts'),
        ((SELECT id FROM trip_days WHERE trip_id = 1 AND day_number = 12), 1, 'Lenox', 42.3557, -73.2712, 'Cultural town in the Berkshires'),
        ((SELECT id FROM trip_days WHERE trip_id = 1 AND day_number = 13), 1, 'Gillette Castle', 41.4240, -72.4267, 'Unique castle in Connecticut')
      ON CONFLICT DO NOTHING;
    `;

    await client.query(schema);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Database setup completed successfully'
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Database setup failed',
        details: error.message
      })
    };
  } finally {
    await client.end();
  }
}