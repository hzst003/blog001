/**
 * 将 ../beer_images、../beverage_images 导入到 PocketBase 商品图片。
 * 按文件名匹配已有商品并更新图片；无匹配则新建。
 *   node scripts/import-beer-beverage-images.mjs
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvLocal } from './load-env.mjs';
import { compressImageBuffer } from './compress-image.mjs';

loadEnvLocal();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storeRoot = path.resolve(__dirname, '..');
const beerDir = path.resolve(storeRoot, '..', 'beer_images');
const beverageDir = path.resolve(storeRoot, '..', 'beverage_images');
const PB_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const SUPER_EMAIL = process.env.PB_SUPER_EMAIL || 'super@example.com';
const SUPER_PASS = process.env.PB_SUPER_PASSWORD || 'superadmin123456';

/** 饮料文件名前缀 → 商品 */
const BEVERAGE_PREFIX = {
  coke: { title: '可乐', price: 5, description: '冰镇碳酸饮料', category: '饮料' },
  juice: { title: '橙汁', price: 12, description: '鲜榨风味橙汁', category: '饮料' },
  lemonade: { title: '柠檬茶', price: 12, description: '清爽茶饮', category: '饮料' },
  tea: { title: '酸梅汤', price: 10, description: '解腻开胃', category: '饮料' },
  milk: { title: '牛奶', price: 6, description: '香浓牛奶', category: '饮料' },
  coffee: { title: '咖啡', price: 15, description: '现磨咖啡', category: '饮料' },
};

/** 啤酒图按文件名排序后，依次赋给这些商品（缺则新建） */
const BEER_ASSIGN_ORDER = [
  { title: '青岛啤酒', price: 8, description: '经典拉格，冰镇更佳' },
  { title: '雪花啤酒', price: 6, description: '清爽易饮' },
  { title: '黑啤', price: 18, description: '麦香浓郁' },
  { title: '精酿 IPA', price: 28, description: '花香苦韵，精酿风味' },
  { title: '自酿啤酒', price: 38, description: '店内自酿鲜啤' },
  { title: '百威啤酒', price: 10, description: '畅销淡啤' },
  { title: '哈尔滨啤酒', price: 7, description: '东北经典' },
  { title: '燕京啤酒', price: 7, description: '清爽醇正' },
  { title: '科罗娜', price: 15, description: '墨西哥风味拉格' },
  { title: '喜力啤酒', price: 12, description: '国际经典淡啤' },
  { title: '乌苏啤酒', price: 9, description: '大乌苏风味' },
  { title: '福佳白啤', price: 16, description: '比利时风味白啤' },
];

async function authSuper() {
  const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: SUPER_EMAIL, password: SUPER_PASS }),
  });
  if (!res.ok) throw new Error(`超级管理员登录失败: ${await res.text()}`);
  return (await res.json()).token;
}

async function api(token, method, urlPath, body) {
  const res = await fetch(`${PB_URL}${urlPath}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) throw new Error(`${method} ${urlPath} -> ${res.status}: ${text}`);
  return data;
}

async function listImageFiles(dir) {
  const names = await readdir(dir);
  const out = [];
  for (const name of names) {
    if (!/\.(png|jpe?g|webp|gif)$/i.test(name)) continue;
    const full = path.join(dir, name);
    const st = await stat(full);
    out.push({ name, full, size: st.size });
  }
  return out;
}

/** 同前缀多张图时取文件更大的一张 */
function pickBestByPrefix(files, prefix) {
  const matched = files.filter((f) =>
    f.name.toLowerCase().startsWith(`${prefix.toLowerCase()}_`),
  );
  if (!matched.length) return null;
  return matched.sort((a, b) => b.size - a.size)[0];
}

async function findByTitle(token, title) {
  const filter = encodeURIComponent(`title="${title}"`);
  const list = await api(
    token,
    'GET',
    `/api/collections/products/records?filter=${filter}&perPage=1`,
  );
  return list.items?.[0] || null;
}

async function upsertProductImage(token, meta, file) {
  const raw = await readFile(file.full);
  const compressed = await compressImageBuffer(raw, file.name);
  const blob = new Blob([compressed.bytes], { type: compressed.mime });
  const form = new FormData();
  form.append('title', meta.title);
  form.append('price', String(meta.price));
  form.append('description', meta.description);
  form.append('category', meta.category);
  form.append('stock', '50');
  form.append('active', 'true');
  form.append('image', blob, compressed.filename);

  const existing = await findByTitle(token, meta.title);
  const url = existing
    ? `${PB_URL}/api/collections/products/records/${existing.id}`
    : `${PB_URL}/api/collections/products/records`;
  const method = existing ? 'PATCH' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { Authorization: token },
    body: form,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${method}「${meta.title}」失败: ${res.status} ${text}`);
  }
  return { created: !existing, title: meta.title, file: file.name };
}

async function importBeverages(token) {
  const files = await listImageFiles(beverageDir);
  console.log(`  扫描饮料图 ${files.length} 张`);
  let n = 0;
  for (const [prefix, meta] of Object.entries(BEVERAGE_PREFIX)) {
    const file = pickBestByPrefix(files, prefix);
    if (!file) {
      console.log(`  · 跳过 ${prefix}_*（无文件）`);
      continue;
    }
    const r = await upsertProductImage(token, meta, file);
    console.log(`  ✓ ${r.title} ← ${r.file} (${r.created ? '新建' : '更新'})`);
    n += 1;
  }
  return n;
}

async function importBeers(token) {
  const files = (await listImageFiles(beerDir)).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true }),
  );
  console.log(`  扫描啤酒图 ${files.length} 张`);
  let n = 0;
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const slot = BEER_ASSIGN_ORDER[i] || {
      title: `精选啤酒 ${i + 1}`,
      price: 10,
      description: '精选啤酒，到店品尝',
    };
    const meta = { ...slot, category: '啤酒' };
    const r = await upsertProductImage(token, meta, file);
    console.log(`  ✓ ${r.title} ← ${r.file} (${r.created ? '新建' : '更新'})`);
    n += 1;
  }
  return n;
}

async function main() {
  const beerOnly = process.argv.includes('--beer-only');
  const drinksOnly = process.argv.includes('--drinks-only');

  console.log(`目标 PocketBase: ${PB_URL}`);
  console.log('1) 登录…');
  const token = await authSuper();

  let beers = 0;
  let drinks = 0;
  if (!drinksOnly) {
    console.log('2) 导入啤酒图片…');
    beers = await importBeers(token);
  }
  if (!beerOnly) {
    console.log('3) 导入饮料图片…');
    drinks = await importBeverages(token);
  }

  console.log(`\n完成：啤酒 ${beers}、饮料 ${drinks}。刷新首页 / 管理页查看。`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
