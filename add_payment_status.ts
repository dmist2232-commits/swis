import { Pool } from 'pg';
const pool = new Pool({
  connectionString: 'postgresql://dmist2232%40gmail.com:200732503140@sisaranew-sisara-en5m2b:5432/SISARA'
});

async function run() {
  try {
    await pool.query(`ALTER TABLE orders ADD COLUMN "paymentStatus" TEXT DEFAULT 'pending'`);
    console.log("Column added");
  } catch (e: any) {
    console.log("Error or column exists:", e.message);
  }
  process.exit();
}
run();
