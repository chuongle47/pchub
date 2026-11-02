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
const targetEmail = process.argv[2] || 'admin@pchub.vn';
const targetRole = process.argv[3] || 'admin';

if (!dbUrl) {
  console.error('Không tìm thấy DATABASE_URL');
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    // 1. Check if user exists in auth.users
    const res = await client.query('SELECT id, email FROM auth.users WHERE email = $1', [targetEmail]);
    if (res.rows.length === 0) {
      console.log(`⚠️ User với email "${targetEmail}" chưa đăng ký trong Supabase Auth.`);
      console.log(`👉 Hãy vào trang web đăng ký tài khoản với email "${targetEmail}" hoặc tạo trên Supabase Auth Dashboard.`);
      console.log(`Sau đó chạy lại lệnh: node scripts/promote-admin.mjs ${targetEmail} ${targetRole}`);
      return;
    }

    const userId = res.rows[0].id;
    // 2. Update role in profiles
    await client.query(
      `INSERT INTO public.profiles (id, email, full_name, role)
       VALUES ($1, $2, 'Quản Trị Viên PCHub', $3)
       ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, email = EXCLUDED.email`,
      [userId, targetEmail, targetRole]
    );

    console.log(`🎉 ĐÃ CẤP QUYỀN [${targetRole.toUpperCase()}] THÀNH CÔNG CHO TÀI KHOẢN: ${targetEmail}`);
  } catch (err) {
    console.error('Lỗi:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();