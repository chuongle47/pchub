import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!dbUrl) {
  console.log('[Runner] Không tìm thấy biến DATABASE_URL hoặc POSTGRES_URL trong .env.local.');
  process.exit(0);
}

const { Pool } = pg;
const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Đã kết nối thành công tới cơ sở dữ liệu Supabase!');

    const migrationDir = path.resolve(__dirname, '../supabase/migrations');
    const files = fs.readdirSync(migrationDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      console.log(`\n⏳ Đang áp dụng migration: ${file}...`);
      let sql = fs.readFileSync(path.join(migrationDir, file), 'utf8');
      sql = sql.replace(/^\uFEFF/, ''); // Strip UTF-8 BOM
      await client.query(sql);
      console.log(`✅ Hoàn thành: ${file}`);
    }

    // Run seed.sql if exists
    const seedFile = path.resolve(__dirname, '../supabase/seed.sql');
    if (fs.existsSync(seedFile)) {
      console.log(`\n⏳ Đang nạp dữ liệu mẫu từ seed.sql...`);
      let seedSql = fs.readFileSync(seedFile, 'utf8');
      seedSql = seedSql.replace(/^\uFEFF/, '');
      await client.query(seedSql);
      console.log(`✅ Hoàn thành nạp dữ liệu seed.sql!`);
    }

    console.log('\n🎉 TOÀN BỘ MIGRATION VÀ SEED ĐÃ ĐƯỢC ÁP DỤNG THÀNH CÔNG VÀO SUPABASE!');
  } catch (err) {
    console.error('❌ Lỗi khi thực thi SQL:', err.message);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

run();