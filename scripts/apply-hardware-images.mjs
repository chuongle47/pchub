import pg from 'pg';

const pool = new pg.Pool({ 
  connectionString: 'postgresql://postgres:LeChuong1810@db.nlalyoyazlgsimzudtxw.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('=== BẮT ĐẦU CẬP NHẬT ẢNH CHUẨN XÁC THEO TỪNG DÒNG SẢN PHẨM ===\n');

  // 1. CPU
  console.log('--- 1. Cập nhật CPU ---');
  await pool.query(`
    UPDATE products SET images = ARRAY['/images/hardware/cpu-intel-ultra.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000001' AND name ILIKE '%Ultra%';

    UPDATE products SET images = ARRAY['/images/hardware/cpu-intel-i9.jpg', '/images/i9-detail.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000001' AND name ILIKE '%i9%';

    UPDATE products SET images = ARRAY['/images/hardware/cpu-intel-i7.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000001' AND name ILIKE '%i7%';

    UPDATE products SET images = ARRAY['/images/hardware/cpu-intel-i5.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000001' AND name ILIKE '%i5%';

    UPDATE products SET images = ARRAY['/images/hardware/cpu-intel-i3.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000001' AND (name ILIKE '%i3%' OR name ILIKE '%Celeron%' OR name ILIKE '%Pentium%');

    UPDATE products SET images = ARRAY['/images/hardware/cpu-amd-ryzen9.jpg', '/images/cpu-box.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000001' AND (name ILIKE '%Ryzen 9%' OR name ILIKE '%5950X%' OR name ILIKE '%5900%');

    UPDATE products SET images = ARRAY['/images/hardware/cpu-amd-ryzen7.jpg', '/images/cpu-box.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000001' AND (name ILIKE '%Ryzen 7%' OR name ILIKE '%7800X%' OR name ILIKE '%5800X%' OR name ILIKE '%5700%');

    UPDATE products SET images = ARRAY['/images/hardware/cpu-amd-ryzen5.jpg', '/images/cpu-box.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000001' AND (name ILIKE '%Ryzen 5%' OR name ILIKE '%7600%' OR name ILIKE '%7500%' OR name ILIKE '%5600%' OR name ILIKE '%5500%' OR name ILIKE '%Athlon%' OR name ILIKE '%Ryzen 3%');
  `);

  // 2. GPU
  console.log('--- 2. Cập nhật GPU ---');
  await pool.query(`
    UPDATE products SET images = ARRAY['/images/hardware/gpu-rog-strix.jpg', '/images/gpu-strix.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000004' AND name ILIKE '%ROG Strix%';

    UPDATE products SET images = ARRAY['/images/hardware/gpu-tuf-gaming.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000004' AND name ILIKE '%TUF%';

    UPDATE products SET images = ARRAY['/images/hardware/gpu-msi-suprim.jpg', '/images/gpu-white.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000004' AND (name ILIKE '%Suprim%' OR name ILIKE '%MSI%');

    UPDATE products SET images = ARRAY['/images/hardware/gpu-aorus-master.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000004' AND name ILIKE '%AORUS%';

    UPDATE products SET images = ARRAY['/images/hardware/gpu-gigabyte-aero.jpg', '/images/gpu-white.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000004' AND name ILIKE '%AERO%';

    UPDATE products SET images = ARRAY['/images/hardware/gpu-gigabyte-gaming.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000004' AND (name ILIKE '%Eagle%' OR name ILIKE '%Gaming OC%');

    UPDATE products SET images = ARRAY['/images/hardware/gpu-asus-dual.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000004' AND (name ILIKE '%Dual%' OR name ILIKE '%Phoenix%');

    UPDATE products SET images = ARRAY['/images/hardware/gpu-rog-strix.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000004' AND name ILIKE '%EVGA%';
  `);

  // 3. MAINBOARD
  console.log('--- 3. Cập nhật Mainboard ---');
  await pool.query(`
    UPDATE products SET images = ARRAY['/images/hardware/mb-rog-maximus.jpg', '/images/mainboard.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000002' AND (name ILIKE '%MAXIMUS%' OR name ILIKE '%CROSSHAIR%' OR name ILIKE '%APEX%');

    UPDATE products SET images = ARRAY['/images/hardware/mb-rog-strix.jpg', '/images/cat-mainboard.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000002' AND name ILIKE '%ROG STRIX%';

    UPDATE products SET images = ARRAY['/images/hardware/mb-tuf-gaming.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000002' AND name ILIKE '%TUF%';

    UPDATE products SET images = ARRAY['/images/hardware/mb-prime.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000002' AND name ILIKE '%PRIME%';

    UPDATE products SET images = ARRAY['/images/hardware/mb-msi-godlike.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000002' AND (name ILIKE '%GODLIKE%' OR name ILIKE '%MEG%');

    UPDATE products SET images = ARRAY['/images/hardware/mb-tuf-gaming.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000002' AND (name ILIKE '%MORTAR%' OR name ILIKE '%MAG%' OR name ILIKE '%TOMAHAWK%');

    UPDATE products SET images = ARRAY['/images/hardware/mb-aorus-master.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000002' AND name ILIKE '%AORUS%';

    UPDATE products SET images = ARRAY['/images/hardware/mb-prime.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000002' AND (name ILIKE '%DS3H%' OR name ILIKE '%H610M%');

    UPDATE products SET images = ARRAY['/images/hardware/mb-asrock-taichi.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000002' AND name ILIKE '%Taichi%';

    UPDATE products SET images = ARRAY['/images/hardware/mb-prime.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000002' AND (name ILIKE '%Steel Legend%' OR name ILIKE '%Riptide%' OR name ILIKE '%Sonic%');
  `);

  // 4. RAM
  console.log('--- 4. Cập nhật RAM ---');
  await pool.query(`
    UPDATE products SET images = ARRAY['/images/hardware/ram-dominator-titanium.jpg', '/images/ram-rgb.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000003' AND name ILIKE '%Dominator%';

    UPDATE products SET images = ARRAY['/images/hardware/ram-trident-z-royal.jpg', '/images/ram-rgb.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000003' AND name ILIKE '%Royal%';

    UPDATE products SET images = ARRAY['/images/hardware/ram-trident-z5-rgb.jpg', '/images/ram-rgb.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000003' AND (name ILIKE '%Trident Z%' OR name ILIKE '%Trident Z5%');

    UPDATE products SET images = ARRAY['/images/hardware/ram-vengeance-rgb.jpg', '/images/ram-rgb.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000003' AND (name ILIKE '%Vengeance RGB%' OR name ILIKE '%Spectrix%' OR name ILIKE '%Lancer%');

    UPDATE products SET images = ARRAY['/images/hardware/ram-vengeance-lpx.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000003' AND (name ILIKE '%Vengeance LPX%' OR name ILIKE '%Ripjaws%');

    UPDATE products SET images = ARRAY['/images/hardware/ram-fury-beast.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000003' AND (name ILIKE '%FURY Beast%' OR name ILIKE '%Ballistix%');

    UPDATE products SET images = ARRAY['/images/hardware/ram-trident-z5-rgb.jpg', '/images/ram-rgb.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000003' AND name ILIKE '%FURY Renegade%';

    UPDATE products SET images = ARRAY['/images/hardware/ram-crucial-bare.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000003' AND (name ILIKE '%CT8G%' OR name ILIKE '%Crucial Pro%');
  `);

  // 5. STORAGE
  console.log('--- 5. Cập nhật Storage (SSD / HDD) ---');
  await pool.query(`
    -- Mechanical HDDs get authentic 3.5" HDD image!
    UPDATE products SET images = ARRAY['/images/hardware/hdd-seagate-barracuda.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000005' AND (name ILIKE '%HDD%' OR name ILIKE '%Barracuda%');

    -- 2.5 SATA SSDs get authentic 2.5 SATA casing image!
    UPDATE products SET images = ARRAY['/images/hardware/ssd-sata-25.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000005' AND (name ILIKE '%870 EVO%' OR name ILIKE '%SATA%');

    -- High-end Samsung NVMe
    UPDATE products SET images = ARRAY['/images/hardware/ssd-samsung-990-pro.jpg', '/images/ssd-nvme.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000005' AND (name ILIKE '%990 Pro%' OR name ILIKE '%980 Pro%');

    -- Kingston NVMe
    UPDATE products SET images = ARRAY['/images/hardware/ssd-kingston-kc3000.jpg', '/images/ssd-nvme.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000005' AND (name ILIKE '%KC3000%' OR name ILIKE '%NV3%' OR name ILIKE '%NV2%');

    -- Other NVMe
    UPDATE products SET images = ARRAY['/images/hardware/ssd-samsung-990-pro.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000005' AND (name ILIKE '%NM790%' OR name ILIKE '%Rocket%' OR name ILIKE '%Legend%' OR name ILIKE '%FireCuda%');
  `);

  // 6. COOLING
  console.log('--- 6. Cập nhật Tản Nhiệt ---');
  await pool.query(`
    UPDATE products SET images = ARRAY['/images/hardware/cooler-noctua-d15.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000008' AND name ILIKE '%Noctua%';

    UPDATE products SET images = ARRAY['/images/hardware/cooler-deepcool-ak620.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000008' AND (name ILIKE '%AK620%' OR name ILIKE '%AK500%' OR name ILIKE '%Hyper 622%' OR name ILIKE '%Assassin%' OR name ILIKE '%TL-D12%' OR name ILIKE '%Fuma%' OR name ILIKE '%Mugen%' OR name ILIKE '%Ninja%');

    UPDATE products SET images = ARRAY['/images/hardware/cooler-arctic-freeze.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000008' AND name ILIKE '%Arctic%';

    UPDATE products SET images = ARRAY['/images/hardware/cooler-corsair-h150i.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000008' AND (name ILIKE '%H150i%' OR name ILIKE '%RYUJIN%' OR name ILIKE '%LC II%' OR name ILIKE '%EK-%');

    UPDATE products SET images = ARRAY['/images/hardware/cooler-deepcool-lt720.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000008' AND (name ILIKE '%LT720%' OR name ILIKE '%LT520%' OR name ILIKE '%LT360%' OR name ILIKE '%FrostFlow%' OR name ILIKE '%CORELIQUID%');
  `);

  // 7. PSU
  console.log('--- 7. Cập nhật Nguồn PSU ---');
  await pool.query(`
    UPDATE products SET images = ARRAY['/images/hardware/psu-corsair-rmx.jpg', '/images/cat-psu.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000006' AND (name ILIKE '%Corsair%' OR name ILIKE '%RM%' OR name ILIKE '%HX%');

    UPDATE products SET images = ARRAY['/images/hardware/psu-seasonic-focus.jpg', '/images/cat-psu.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000006' AND (name ILIKE '%Seasonic%' OR name ILIKE '%Antec%');

    UPDATE products SET images = ARRAY['/images/hardware/psu-bequiet-darkpower.jpg', '/images/cat-psu.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000006' AND (name ILIKE '%Be Quiet%' OR name ILIKE '%Cooler Master%' OR name ILIKE '%Deepcool%' OR name ILIKE '%EVGA%');
  `);

  // 8. CASE
  console.log('--- 8. Cập nhật Case Vỏ Máy Tính ---');
  await pool.query(`
    UPDATE products SET images = ARRAY['/images/hardware/case-corsair-4000d.jpg', '/images/hero-pc.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000007' AND (name ILIKE '%4000D%' OR name ILIKE '%5000D%' OR name ILIKE '%3000D%' OR name ILIKE '%Airflow%');

    UPDATE products SET images = ARRAY['/images/hardware/case-corsair-2000d.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000007' AND (name ILIKE '%2000D%' OR name ILIKE '%Mini-ITX%' OR name ILIKE '%AP201%');

    UPDATE products SET images = ARRAY['/images/hardware/case-thermaltake-versa.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000007' AND (name ILIKE '%Versa%' OR name ILIKE '%MasterBox Q300L%' OR name ILIKE '%NR600%');

    UPDATE products SET images = ARRAY['/images/hardware/case-panoramic-glass.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000007' AND (name ILIKE '%HAF%' OR name ILIKE '%Helios%' OR name ILIKE '%BitFenix%' OR name ILIKE '%Glass%');
  `);

  // 9. MONITOR, GEAR, HEADSET
  console.log('--- 9. Cập nhật Màn Hình, Gear, Headset hiện tại ---');
  await pool.query(`
    UPDATE products SET images = ARRAY['/images/hardware/monitor-asus-rog-oled.jpg', '/images/cat-monitor.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000009';

    UPDATE products SET images = ARRAY['/images/hardware/gear-razer-blackwidow.jpg', '/images/cat-gear.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000010';

    UPDATE products SET images = ARRAY['/images/hardware/headset-logitech-gprox2.jpg', '/images/cat-headset.jpg']
    WHERE category_id = 'c1000000-0000-0000-0000-000000000011';
  `);

  // 10. THÊM CÁC SẢN PHẨM PHỔ BIẾN CHO MONITOR, GEAR, HEADSET ĐỂ DANH MỤC KHÔNG BỊ TRỐNG
  console.log('--- 10. Bổ sung các sản phẩm Màn hình, Gear, Tai nghe cao cấp đa dạng ---');
  const extraProducts = [
    // Monitors
    {
      name: 'Màn hình Gaming LG UltraGear 27GR95QE-B 27" 2K OLED 240Hz 0.03ms',
      slug: 'monitor-lg-ultragear-27gr95qe',
      price: 19990000,
      sale_price: 18490000,
      category_id: 'c1000000-0000-0000-0000-000000000009',
      images: ['/images/hardware/monitor-lg-ultragear.jpg', '/images/cat-monitor.jpg'],
      specs: { size: '27 inch', resolution: '2560 x 1440 (2K)', panel: 'OLED', refresh_rate: '240Hz', response_time: '0.03ms' }
    },
    {
      name: 'Màn hình cong Samsung Odyssey G7 32" 2K 240Hz 1ms 1000R HDR600',
      slug: 'monitor-samsung-odyssey-g7-32',
      price: 14590000,
      sale_price: 13290000,
      category_id: 'c1000000-0000-0000-0000-000000000009',
      images: ['/images/hardware/monitor-samsung-odyssey.jpg', '/images/cat-monitor.jpg'],
      specs: { size: '32 inch', resolution: '2560 x 1440 (2K)', panel: 'VA Cong 1000R', refresh_rate: '240Hz', response_time: '1ms' }
    },
    {
      name: 'Màn hình đồ họa Dell UltraSharp U2724D 27" 2K 120Hz IPS Black 98% DCI-P3',
      slug: 'monitor-dell-ultrasharp-u2724d',
      price: 11890000,
      sale_price: 10990000,
      category_id: 'c1000000-0000-0000-0000-000000000009',
      images: ['/images/hardware/monitor-dell-ultrasharp.jpg', '/images/cat-monitor.jpg'],
      specs: { size: '27 inch', resolution: '2560 x 1440 (2K)', panel: 'IPS Black', refresh_rate: '120Hz', color: '98% DCI-P3' }
    },

    // Gear
    {
      name: 'Chuột gaming không dây Logitech G PRO X SUPERLIGHT 2 LIGHTSPEED White',
      slug: 'gear-logitech-g-pro-x-superlight-2-white',
      price: 3690000,
      sale_price: 3290000,
      category_id: 'c1000000-0000-0000-0000-000000000010',
      images: ['/images/hardware/gear-logitech-superlight.jpg', '/images/cat-gear.jpg'],
      specs: { sensor: 'HERO 2 (32000 DPI)', weight: '60g', switch: 'LIGHTFORCE Hybrid', battery: '95 giờ' }
    },
    {
      name: 'Chuột gaming cao cấp Logitech G502 X PLUS LIGHTSPEED Wireless RGB Black',
      slug: 'gear-logitech-g502-x-plus-rgb',
      price: 3890000,
      sale_price: 3490000,
      category_id: 'c1000000-0000-0000-0000-000000000010',
      images: ['/images/hardware/gear-logitech-g502x.jpg', '/images/cat-gear.jpg'],
      specs: { sensor: 'HERO 25K', switch: 'LIGHTFORCE Optical-Mechanical', rgb: 'LIGHTSYNC 8-Zone', battery: '120 giờ' }
    },
    {
      name: 'Bàn phím cơ không dây SteelSeries Apex Pro TKL Wireless OmniPoint 2.0',
      slug: 'gear-steelseries-apex-pro-tkl-wireless',
      price: 6490000,
      sale_price: 5890000,
      category_id: 'c1000000-0000-0000-0000-000000000010',
      images: ['/images/hardware/gear-steelseries-apex.jpg', '/images/cat-gear.jpg'],
      specs: { switch: 'OmniPoint 2.0 Adjustable', layout: 'Tenkeyless (TKL)', display: 'OLED Smart Display', connectivity: '2.4GHz + BT 5.0' }
    },

    // Headset
    {
      name: 'Tai nghe gaming không dây HyperX Cloud III Wireless Black/Red (120 Giờ Pin)',
      slug: 'headset-hyperx-cloud-iii-wireless',
      price: 3990000,
      sale_price: 3490000,
      category_id: 'c1000000-0000-0000-0000-000000000011',
      images: ['/images/hardware/headset-hyperx-cloud3.jpg', '/images/cat-headset.jpg'],
      specs: { driver: '53mm Angled', battery: '120 giờ', mic: '10mm Noise-Canceling', surround: 'DTS Headphone:X Spatial' }
    },
    {
      name: 'Tai nghe gaming cao cấp SteelSeries Arctis Nova Pro Wireless Multi-System',
      slug: 'headset-steelseries-arctis-nova-pro-wireless',
      price: 8990000,
      sale_price: 8190000,
      category_id: 'c1000000-0000-0000-0000-000000000011',
      images: ['/images/hardware/headset-steelseries-nova.jpg', '/images/cat-headset.jpg'],
      specs: { audio: 'Hi-Res Certified Pro Acoustic', anc: 'Active Noise Cancellation 4-Mic', dac: 'Base Station OLED Dual USB', battery: 'Infinity Power System' }
    }
  ];

  for (const p of extraProducts) {
    const exists = await pool.query('SELECT id FROM products WHERE slug = $1', [p.slug]);
    if (exists.rows.length === 0) {
      await pool.query(`
        INSERT INTO products (
          name, slug, price, sale_price, category_id, images, specs, stock, is_active, is_hot
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, 50, true, true
        )
      `, [p.name, p.slug, p.price, p.sale_price, p.category_id, p.images, JSON.stringify(p.specs)]);
      console.log(`[INSERTED] ${p.name}`);
    } else {
      await pool.query(`
        UPDATE products 
        SET images = $1, specs = $2, sale_price = $3, is_hot = true
        WHERE slug = $4
      `, [p.images, JSON.stringify(p.specs), p.sale_price, p.slug]);
      console.log(`[UPDATED] ${p.name}`);
    }
  }

  console.log('\n=== KIỂM TRA PHÂN BỐ ẢNH MỚI TOÀN BỘ DANH MỤC TRONG SUPABASE ===');
  const summary = await pool.query(`
    SELECT c.name as category, count(DISTINCT p.images[1]) as distinct_primary_images, count(p.id) as total_products
    FROM products p
    JOIN categories c ON p.category_id = c.id
    GROUP BY c.name
    ORDER BY total_products DESC
  `);
  console.table(summary.rows);

  await pool.end();
}

main().catch(console.error);
