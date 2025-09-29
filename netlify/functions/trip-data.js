// Netlify Function to serve trip data from Neon PostgreSQL
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function handler(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    await client.connect();

    const method = event.httpMethod;
    const { tripId = 1 } = event.queryStringParameters || {};

    switch (method) {
      case 'GET':
        return await getTripData(tripId, headers);

      case 'POST':
        return await createStop(JSON.parse(event.body), headers);

      case 'PUT':
        return await updateStop(JSON.parse(event.body), headers);

      case 'DELETE':
        const { stopId } = event.queryStringParameters || {};
        return await deleteStop(stopId, headers);

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Database error',
        details: error.message
      })
    };
  } finally {
    await client.end();
  }
}

async function getTripData(tripId, headers) {
  const query = `
    SELECT
      day_number,
      date,
      color,
      location,
      latitude,
      longitude,
      notes,
      stop_id
    FROM trip_data_view
    WHERE trip_id = $1
    ORDER BY day_number, stop_number
  `;

  const result = await client.query(query, [tripId]);

  // Transform to match frontend expected format
  const tripData = {};

  result.rows.forEach(row => {
    const day = row.day_number;

    if (!tripData[day]) {
      tripData[day] = {
        color: row.color,
        date: row.date,
        stops: []
      };
    }

    tripData[day].stops.push({
      id: row.stop_id,
      name: row.location,
      lat: parseFloat(row.latitude),
      lon: parseFloat(row.longitude),
      notes: row.notes || '',
      date: row.date
    });
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      data: tripData,
      totalDays: Object.keys(tripData).length
    })
  };
}

async function createStop(stopData, headers) {
  const { dayNumber, name, latitude, longitude, notes, tripId = 1 } = stopData;

  // Get the trip_day_id
  const dayQuery = `
    SELECT id FROM trip_days
    WHERE trip_id = $1 AND day_number = $2
  `;
  const dayResult = await client.query(dayQuery, [tripId, dayNumber]);

  if (dayResult.rows.length === 0) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Day not found' })
    };
  }

  const tripDayId = dayResult.rows[0].id;

  // Get the next stop number
  const stopNumberQuery = `
    SELECT COALESCE(MAX(stop_number), 0) + 1 as next_stop_number
    FROM stops WHERE trip_day_id = $1
  `;
  const stopNumberResult = await client.query(stopNumberQuery, [tripDayId]);
  const stopNumber = stopNumberResult.rows[0].next_stop_number;

  // Insert the new stop
  const insertQuery = `
    INSERT INTO stops (trip_day_id, stop_number, name, latitude, longitude, notes)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `;

  const result = await client.query(insertQuery, [
    tripDayId, stopNumber, name, latitude, longitude, notes
  ]);

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      success: true,
      stopId: result.rows[0].id,
      message: 'Stop created successfully'
    })
  };
}

async function updateStop(stopData, headers) {
  const { stopId, name, latitude, longitude, notes } = stopData;

  const query = `
    UPDATE stops
    SET name = $1, latitude = $2, longitude = $3, notes = $4, updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING id
  `;

  const result = await client.query(query, [name, latitude, longitude, notes, stopId]);

  if (result.rows.length === 0) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Stop not found' })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Stop updated successfully'
    })
  };
}

async function deleteStop(stopId, headers) {
  const query = `DELETE FROM stops WHERE id = $1 RETURNING id`;
  const result = await client.query(query, [stopId]);

  if (result.rows.length === 0) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Stop not found' })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Stop deleted successfully'
    })
  };
}