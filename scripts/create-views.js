const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres:LeChuong1810@db.nlalyoyazlgsimzudtxw.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected, creating views in Supabase...');

  await client.query(`
    CREATE OR REPLACE VIEW category_product_counts AS 
    SELECT c.id, c.name, c.slug, c.icon, c.is_active, c.created_at, COUNT(p.id)::int as product_count 
    FROM categories c 
    LEFT JOIN products p ON p.category_id = c.id 
    GROUP BY c.id;
  `);

  await client.query(`
    CREATE OR REPLACE VIEW brand_product_counts AS 
    SELECT b.id, b.name, b.slug, b.logo_url, b.is_active, b.created_at, COUNT(p.id)::int as product_count 
    FROM brands b 
    LEFT JOIN products p ON p.brand_id = b.id 
    GROUP BY b.id;
  `);

  console.log('Views created successfully!');

  const resCat = await client.query('SELECT name, product_count FROM category_product_counts ORDER BY product_count DESC;');
  console.table(resCat.rows);

  const resBrand = await client.query('SELECT count(*) FROM brand_product_counts;');
  console.log('Brands view count:', resBrand.rows[0].count);

  await client.end();
}

run().catch(console.error);
