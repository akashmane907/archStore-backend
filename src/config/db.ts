const { Pool } = require('pg')
require('dotenv').config()

console.log("🚀 Starting DB connection...")
console.log("DB URL:", process.env.DATABASE_URL)


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

pool.connect()
  .then(() => console.log('✅ Connected to Neon PostgreSQL'))
  .catch((err) => console.error('❌ DB connection error:', err))

module.exports = pool
