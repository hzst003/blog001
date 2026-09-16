/**
 * 将 ../酒图片 下的 PNG 导入为 PocketBase products（带图片）。
 * 用法：先确保 pocketbase serve，并已执行 setup:pb
 *   node scripts/import-liquor-images.mjs
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvLocal } from './load-env.mjs';
import { compressImageBuffer } from './compress-image.mjs';

loadEnvLocal();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storeRoot = path.resolve(__dirname, '..');
const imagesDir = path.resolve(storeRoot, '..', '酒图片');
const PB_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

const SUPER_EMAIL = process.env.PB_SUPER_EMAIL || 'super@example.com';
const SUPER_PASS = process.env.PB_SUPER_PASSWORD || 'superadmin123456';

/** 按酒名给个展示价（元） */
const PRICE_BY_TITLE = {
  杏子酒: 58,
  青梅酒: 68,
  杨梅酒: 62,
  蓝莓酒: 72,
  柠檬酒: 55,
  百香果酒: 75,
  草莓酒: 65,
  菠萝酒: 60,
  樱桃酒: 78,
  荔枝酒: 70,
  柚子酒: 66,
  桂圆酒: 80,
  桃子酒: 64,
  桑葚酒: 74,
  米酒: 48,
  自酿啤酒: 38,
  葡萄酒: 98,
  蜂蜜酒: 88,
};

function titleFromFilename(filename) {
  return filename.replace(/^\d+_/, '').replace(/\.png$/i, '');
}

async function authSuper() {
  const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: SUPER_EMAIL, password: SUPER_PASS }),
  });
  if (!res.ok) {
    throw new Error(`超级管理员登录失败: ${await res.text()}`);
  }
  const data = await res.json();
  return data.token;
}

async function api(token, method, urlPath, body) {
  const res = await fetch(`${PB_URL}${urlPath}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`${method} ${urlPath} -> ${res.status}: ${text}`);
  }
  return data;
}

async function ensureLiquorCategory(token) {
  const col = await api(token, 'GET', '/api/collections/products');
  const fields = (col.fields || []).map((f) => {
    if (f.name === 'category' && f.type === 'select') {
  const values = Array.from(
        new Set([...(f.values || []), '酒水', '啤酒', '饮料', '食品', '其它']),
      );
      return { ...f, values, maxSelect: 1 };
    }
    return f;
  });
  await api(token, 'PATCH', `/api/collections/${col.id}`, { fields });
  console.log('  已确保 category 含「酒水」');
}

async function clearProducts(token) {
  let deleted = 0;
  for (;;) {
    const list = await api(token, 'GET', '/api/collections/products/records?perPage=50');
    const items = list.items || [];
    if (!items.length) break;
    for (const item of items) {
      await api(token, 'DELETE', `/api/collections/products/records/${item.id}`);
      deleted += 1;
    }
  }
  if (deleted) console.log(`  已清空旧商品 ${deleted} 条`);
  else console.log('  商品表为空，无需清空');
}

/** 去重：同名只保留一张，优先无序号前缀、文件更大的 */
async function collectUniqueImages() {
  const names = (await readdir(imagesDir)).filter((n) => /\.png$/i.test(n));
  /** @type {Map<string, { file: string, size: number, numbered: boolean }>} */
  const byTitle = new Map();

  for (const file of names) {
    const title = titleFromFilename(file);
    const buf = await readFile(path.join(imagesDir, file));
    const numbered = /^\d+_/.test(file);
    const prev = byTitle.get(title);
    const candidate = { file, size: buf.length, numbered };
    if (!prev) {
      byTitle.set(title, candidate);
      continue;
    }
    // 优先无序号；同类型则取更大文件
    const better =
      (!candidate.numbered && prev.numbered) ||
      (candidate.numbered === prev.numbered && candidate.size > prev.size);
    if (better) byTitle.set(title, candidate);
  }

  return [...byTitle.entries()].map(([title, meta]) => ({ title, ...meta }));
}

async function createProductWithImage(token, { title, file }) {
  const filePath = path.join(imagesDir, file);
  const raw = await readFile(filePath);
  const compressed = await compressImageBuffer(raw, file);
  const blob = new Blob([compressed.bytes], { type: compressed.mime });
  const price = PRICE_BY_TITLE[title] ?? 68;

  const form = new FormData();
  form.append('title', title);
  form.append('price', String(price));
  form.append('description', `精选${title}，到店品尝`);
  form.append('stock', '50');
  form.append('category', '酒水');
  form.append('active', 'true');
  form.append('image', blob, compressed.filename);

  const res = await fetch(`${PB_URL}/api/collections/products/records`, {
    method: 'POST',
    headers: { Authorization: token },
    body: form,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`创建「${title}」失败: ${res.status} ${text}`);
  }
  return JSON.parse(text);
}

async function main() {
  console.log('1) 登录超级管理员…');
  const token = await authSuper();

  console.log('2) 更新商品分类…');
  await ensureLiquorCategory(token);

  console.log('3) 清空旧商品…');
  await clearProducts(token);

  console.log(`4) 扫描 ${imagesDir} …`);
  const items = await collectUniqueImages();
  console.log(`  去重后 ${items.length} 种酒水`);

  console.log('5) 导入商品与图片…');
  for (const item of items) {
    await createProductWithImage(token, item);
    console.log(`  ✓ ${item.title} ← ${item.file} (¥${PRICE_BY_TITLE[item.title] ?? 68})`);
  }

  console.log(`\n完成，共导入 ${items.length} 条。刷新 http://localhost:3000`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
