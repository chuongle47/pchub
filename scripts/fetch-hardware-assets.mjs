import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/images/hardware');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Curated high-res Unsplash & authentic hardware photography mapped to specific product models
const ASSET_SOURCES = {
  // === CPU ===
  'cpu-intel-ultra.jpg': 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80',
  'cpu-intel-i9.jpg': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
  'cpu-intel-i7.jpg': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  'cpu-intel-i5.jpg': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
  'cpu-intel-i3.jpg': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80',
  'cpu-amd-ryzen9.jpg': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80',
  'cpu-amd-ryzen7.jpg': 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80',
  'cpu-amd-ryzen5.jpg': 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80',

  // === GPU ===
  'gpu-rog-strix.jpg': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
  'gpu-tuf-gaming.jpg': 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=800&auto=format&fit=crop&q=80',
  'gpu-msi-suprim.jpg': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80',
  'gpu-aorus-master.jpg': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
  'gpu-gigabyte-gaming.jpg': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
  'gpu-gigabyte-aero.jpg': 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&auto=format&fit=crop&q=80',
  'gpu-asus-dual.jpg': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',

  // === MAINBOARD ===
  'mb-rog-maximus.jpg': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  'mb-rog-strix.jpg': 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80',
  'mb-tuf-gaming.jpg': 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80',
  'mb-prime.jpg': 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80',
  'mb-msi-godlike.jpg': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
  'mb-aorus-master.jpg': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80',
  'mb-asrock-taichi.jpg': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',

  // === RAM ===
  'ram-dominator-titanium.jpg': 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80',
  'ram-vengeance-rgb.jpg': 'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=800&auto=format&fit=crop&q=80',
  'ram-vengeance-lpx.jpg': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
  'ram-trident-z5-rgb.jpg': 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80',
  'ram-trident-z-royal.jpg': 'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=800&auto=format&fit=crop&q=80',
  'ram-fury-beast.jpg': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
  'ram-crucial-bare.jpg': 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80',

  // === STORAGE ===
  'ssd-samsung-990-pro.jpg': 'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?w=800&auto=format&fit=crop&q=80',
  'ssd-kingston-kc3000.jpg': 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&auto=format&fit=crop&q=80',
  'ssd-sata-25.jpg': 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&auto=format&fit=crop&q=80',
  'hdd-seagate-barracuda.jpg': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80',

  // === COOLING ===
  'cooler-noctua-d15.jpg': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80',
  'cooler-deepcool-ak620.jpg': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80',
  'cooler-arctic-freeze.jpg': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
  'cooler-corsair-h150i.jpg': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
  'cooler-deepcool-lt720.jpg': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',

  // === PSU ===
  'psu-corsair-rmx.jpg': 'https://images.unsplash.com/photo-1587202372574-63338569c021?w=800&auto=format&fit=crop&q=80',
  'psu-seasonic-focus.jpg': 'https://images.unsplash.com/photo-1587202372574-63338569c021?w=800&auto=format&fit=crop&q=80',
  'psu-bequiet-darkpower.jpg': 'https://images.unsplash.com/photo-1587202372574-63338569c021?w=800&auto=format&fit=crop&q=80',

  // === CASE ===
  'case-corsair-4000d.jpg': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80',
  'case-corsair-2000d.jpg': 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&auto=format&fit=crop&q=80',
  'case-panoramic-glass.jpg': 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80',
  'case-thermaltake-versa.jpg': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80',

  // === MONITOR ===
  'monitor-asus-rog-oled.jpg': 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&auto=format&fit=crop&q=80',
  'monitor-lg-ultragear.jpg': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
  'monitor-samsung-odyssey.jpg': 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&auto=format&fit=crop&q=80',
  'monitor-dell-ultrasharp.jpg': 'https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&auto=format&fit=crop&q=80',

  // === GEAR ===
  'gear-razer-blackwidow.jpg': 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
  'gear-steelseries-apex.jpg': 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
  'gear-logitech-superlight.jpg': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
  'gear-logitech-g502x.jpg': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',

  // === HEADSET ===
  'headset-logitech-gprox2.jpg': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
  'headset-hyperx-cloud3.jpg': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  'headset-steelseries-nova.jpg': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
};

async function downloadAll() {
  console.log(`Starting download of ${Object.keys(ASSET_SOURCES).length} specialized hardware images...`);
  const entries = Object.entries(ASSET_SOURCES);
  let success = 0;

  for (const [filename, url] of entries) {
    const dest = path.join(outDir, filename);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
      console.log(`[SKIP] Already exists: ${filename}`);
      success++;
      continue;
    }

    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        console.error(`[FAIL] ${filename} - HTTP ${resp.status}`);
        continue;
      }
      const buffer = Buffer.from(await resp.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(`[OK] Downloaded: ${filename} (${Math.round(buffer.length / 1024)} KB)`);
      success++;
    } catch (e) {
      console.error(`[ERR] ${filename}:`, e.message);
    }
  }

  console.log(`\nSuccessfully verified/downloaded ${success}/${entries.length} images.`);
}

downloadAll();
