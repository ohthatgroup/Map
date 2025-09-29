import { Client } from 'pg';

export async function handler(event, context) {
  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    await client.connect();

    // First, clear existing data
    await client.query('DELETE FROM stops');
    await client.query('DELETE FROM trip_days');
    await client.query('DELETE FROM trips');

    // Insert the trip
    await client.query(`
      INSERT INTO trips (id, name, description) VALUES
      (1, 'New England Fall Adventure', 'October 2024 Fall foliage trip through New England')
    `);

    // Trip data from your CSV
    const tripData = [
      {day: 1, date: '2024-10-03', location: 'Granville, MA', notes: 'Yale University (New Haven, CT); Sleeping Giant State Park (Hamden, CT); Harwinton Fairgrounds (Harwinton, CT); End at 1349 Main Rd, Granville, MA', lat: 42.0612, lon: -72.8676, color: '#ff6b6b'},
      {day: 2, date: '2024-10-04', location: 'White Mountains Region, NH', notes: 'Billings Farm & Museum Harvest Celebration; Start 1349 Main Rd, Granville, MA → End 218 Streeter Rd, Dorchester, NH', lat: 43.9389, lon: -71.6917, color: '#4ecdc4'},
      {day: 3, date: '2024-10-05', location: 'Freeport, ME', notes: 'Freeport Fall Festival; Start 218 Streeter Rd, Dorchester, NH → End 134 Burnett Road, Freeport, ME', lat: 43.8570, lon: -70.1028, color: '#45b7d1'},
      {day: 4, date: '2024-10-06', location: 'Boothbay, ME', notes: 'Start 134 Burnett Road, Freeport, ME → End 553 Wiscasset Road, Boothbay, ME', lat: 43.8529, lon: -69.6278, color: '#96ceb4'},
      {day: 5, date: '2024-10-07', location: 'Acadia (Schoodic Peninsula), ME', notes: 'Start 553 Wiscasset Road, Boothbay, ME → End Farview Dr, Winter Harbor, ME; Schoodic Woods Campground (Site A45)', lat: 44.4203, lon: -68.0639, color: '#ffeaa7'},
      {day: 6, date: '2024-10-08', location: 'Camden area → New Portland, ME', notes: 'Start Farview Dr, Winter Harbor, ME → End 1100 Long Falls Dam Rd, New Portland, ME; Happy Horseshoe Campground', lat: 44.9553, lon: -70.0747, color: '#dda0dd'},
      {day: 7, date: '2024-10-09', location: 'Portland area (Gorham), ME', notes: 'Start 1100 Long Falls Dam Rd, New Portland, ME → End 680 Gray Rd, Gorham, ME; Sebago Sunrise Yurt (Hipcamp)', lat: 43.6795, lon: -70.4419, color: '#98d8c8'},
      {day: 8, date: '2024-10-10', location: 'Salem/Boston, MA', notes: 'White Mountain Oktoberfest; Gondola Skyride Day Ticket; Start 680 Gray Rd, Gorham, ME → End 13 School Street, Everett (Boston area), MA', lat: 42.5195, lon: -70.8967, color: '#f7dc6f'},
      {day: 9, date: '2024-10-11', location: 'Salem/Boston, MA', notes: 'Continue Boston/Salem stay; Hostel: Backpackers Hostel & Pub', lat: 42.5195, lon: -70.8967, color: '#bb8fce'},
      {day: 10, date: '2024-10-12', location: 'Cape Cod (Brewster), MA', notes: '46th Annual Oktoberfest and 20th HONK! Parade; Start 13 School Street, Everett/Boston, MA → End 676 Harwich Rd, Brewster, MA; Sweetwater Forest', lat: 41.7598, lon: -70.0833, color: '#85c1e9'},
      {day: 11, date: '2024-10-13', location: 'Newport area (Tiverton), RI', notes: 'Start 676 Harwich Rd, Brewster, MA → End 2753 Main Rd, Tiverton, RI; 8 Acres Homestead (Hipcamp)', lat: 41.6204, lon: -71.2120, color: '#f8c471'},
      {day: 12, date: '2024-10-14', location: 'Mystic (Old Mystic), CT', notes: 'Mystic Seaport; Start 2753 Main Rd, Tiverton, RI → End 45 Campground Rd, Old Mystic, CT; Sun Outdoors Mystic', lat: 41.3712, lon: -71.9662, color: '#82e0aa'},
      {day: 13, date: '2024-10-15', location: 'Brooklyn, NY', notes: 'Return trip; Start 45 Campground Rd, Old Mystic, CT → End 585 E21st Street, Brooklyn, NY', lat: 40.6782, lon: -73.9442, color: '#f1948a'}
    ];

    // Insert trip days
    for (const data of tripData) {
      await client.query(`
        INSERT INTO trip_days (trip_id, day_number, date, color) VALUES
        (1, $1, $2, $3)
      `, [data.day, data.date, data.color]);
    }

    // Insert stops
    for (const data of tripData) {
      const dayResult = await client.query(`
        SELECT id FROM trip_days WHERE trip_id = 1 AND day_number = $1
      `, [data.day]);

      const tripDayId = dayResult.rows[0].id;

      await client.query(`
        INSERT INTO stops (trip_day_id, stop_number, name, latitude, longitude, notes) VALUES
        ($1, 1, $2, $3, $4, $5)
      `, [tripDayId, data.location, data.lat, data.lon, data.notes]);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Data imported successfully',
        imported: tripData.length
      })
    };

  } catch (error) {
    console.error('Import error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Import failed',
        details: error.message
      })
    };
  } finally {
    await client.end();
  }
}