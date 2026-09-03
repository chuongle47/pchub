const fs = require('fs');
const path = require('path');

const sql = fs.readFileSync(path.join(__dirname, '..', 'data.sql'), 'utf8');

function parseTuples(block) {
  const rows = [];
  let i = 0;
  while (i < block.length) {
    const start = block.indexOf('(', i);
    if (start === -1) break;
    let depth = 0;
    let inStr = false;
    let escape = false;
    let j = start;
    for (; j < block.length; j++) {
      const c = block[j];
      if (inStr) {
        if (escape) {
          escape = false;
          continue;
        }
        if (c === '\\') {
          escape = true;
          continue;
        }
        if (c === "'") {
          inStr = false;
          continue;
        }
      } else {
        if (c === "'") {
          inStr = true;
          continue;
        }
        if (c === '(') depth++;
        if (c === ')') {
          depth--;
          if (depth === 0) {
            j++;
            break;
          }
        }
      }
    }
    const inner = block.slice(start + 1, j - 1);
    rows.push(splitArgs(inner));
    i = j;
  }
  return rows;
}

function splitArgs(s) {
  const args = [];
  let cur = '';
  let inStr = false;
  let escape = false;
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (escape) {
        cur += c;
        escape = false;
        continue;
      }
      if (c === '\\') {
        cur += c;
        escape = true;
        continue;
      }
      if (c === "'") {
        inStr = false;
        cur += c;
        continue;
      }
      cur += c;
    } else {
      if (c === "'") {
        inStr = true;
        cur += c;
        continue;
      }
      if (c === '{') depth++;
      if (c === '}') depth--;
      if (c === ',' && depth === 0) {
        args.push(cur.trim());
        cur = '';
        continue;
      }
      cur += c;
    }
  }
  if (cur.trim()) args.push(cur.trim());
  return args;
}

function unquote(v) {
  v = String(v).trim();
  if (v.endsWith('::jsonb')) v = v.slice(0, -7);
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
  return v;
}

function valuesBlock(table) {
  const insert = sql.split(`INSERT INTO ${table}`)[1];
  return insert.split('VALUES')[1].split('ON CONFLICT')[0];
}

const brandBlock = valuesBlock('brands');
const catBlock = valuesBlock('categories');
const prodBlock = valuesBlock('products');

const brands = parseTuples(brandBlock).map((a) => ({
  id: unquote(a[0]),
  name: unquote(a[1]),
  slug: unquote(a[2]),
  is_active: true,
}));

const categories = parseTuples(catBlock).map((a) => ({
  id: unquote(a[0]),
  name: unquote(a[1]),
  slug: unquote(a[2]),
  icon: unquote(a[3]),
}));

const products = parseTuples(prodBlock).map((a, i) => {
  let specs = {};
  try {
    specs = JSON.parse(unquote(a[7]));
  } catch {
    specs = {};
  }
  return {
    id: 'p-' + (i + 1),
    name: unquote(a[0]),
    slug: unquote(a[1]),
    category_id: unquote(a[2]),
    brand_id: unquote(a[3]),
    sku: unquote(a[4]),
    price: parseFloat(a[5]),
    stock: parseInt(a[6], 10),
    specs,
    image_url: unquote(a[8]),
  };
});

const outPath = path.join(__dirname, '..', 'pchub-next', 'src', 'lib', 'seed.json');
fs.writeFileSync(outPath, JSON.stringify({ brands, categories, products }, null, 2));
console.log('brands', brands.length, 'categories', categories.length, 'products', products.length);
console.log('wrote', outPath);
