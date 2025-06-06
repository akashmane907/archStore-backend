import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log("🚀 Starting DB connection...");
console.log("DB URL:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false 
  },
});

// Test the connection
pool.connect()
  .then(() => console.log('✅ Connected to Neon PostgreSQL'))
  .catch((err: Error) => console.error('❌ DB connection error:', err));

export default pool;