const { readFileSync } = require('fs');
const { Client } = require('pg');

const sql = readFileSync('./scripts/02-seed-data.sql', 'utf-8');

const client = new Client({
  connectionString: 'postgresql://postgres:12345@db.jijywhwzxuaqyelmvnry.supabase.co:5432/postgres',
});

async function run() {
  try {
    await client.connect();
    await client.query(sql);
    console.log('SQL script executed successfully.');
  } catch (err) {
    console.error('Error running script:', err);
  } finally {
    await client.end();
  }
}

run();
