const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'NewWorldJinx',
  port: 5432,
});

const createDatabaseQuery = `CREATE DATABASE nest_backend`;

pool.query(createDatabaseQuery, (err, res) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Database ${res.rows[0].name} created successfully`);
  }
  pool.end();
});
