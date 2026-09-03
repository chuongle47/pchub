import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const schemaPath = path.join(process.cwd(), 'users-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      return NextResponse.json({ 
        success: false, 
        error: 'users-schema.sql file not found' 
      }, { status: 404 });
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const client = await pool.connect();
    
    try {
      await client.query(schemaSql);
      client.release();
      
      return NextResponse.json({ 
        success: true, 
        message: 'Users table created successfully' 
      });
    } catch (dbError) {
      client.release();
      throw dbError;
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Database initialization failed' 
    }, { status: 500 });
  }
}