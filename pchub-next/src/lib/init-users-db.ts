import { pool } from './db';
import fs from 'fs';
import path from 'path';

export async function initUsersDatabase() {
  try {
    const schemaPath = path.join(process.cwd(), 'users-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error('users-schema.sql file not found');
      return { success: false, error: 'Schema file not found' };
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const client = await pool.connect();
    
    try {
      await client.query(schemaSql);
      client.release();
      
      console.log('Users table created successfully');
      return { success: true, message: 'Users table created successfully' };
    } catch (dbError) {
      client.release();
      console.error('Database error:', dbError);
      return { success: false, error: dbError };
    }
  } catch (error) {
    console.error('Initialization error:', error);
    return { success: false, error };
  }
}