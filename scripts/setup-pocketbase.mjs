/**
 * 初始化 PocketBase：超级管理员、users 字段、全部集合、示例商品、App admin。
 * 用法：读取 .env.local 的 POCKETBASE_URL；远端已就绪则仅走 API。
 *   node scripts/setup-pocketbase.mjs
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isLocalPocketBaseUrl, loadEnvLocal } from './load-env.mjs';

loadEnvLocal();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storeRoot = path.resolve(__dirname, '..');
const pbDir = path.resolve(storeRoot, '..', 'pocketbase');
const pbExe = path.join(pbDir, 'pocketbase.exe');
const PB_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

const SUPER_EMAIL = process.env.PB_SUPER_EMAIL || 'super@example.com';
const SUPER_PASS = process.env.PB_SUPER_PASSWORD || 'superadmin123456';
const APP_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.com';
const APP_ADMIN_PASS = process.env.PB_ADMIN_PASSWORD || 'admin123456';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitHealthy(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${PB_URL}/api/health`);
      if (res.ok) return true;
    } catch {
      /* retry */
    }
    await sleep(500);
  }
  return false;
}

function runCli(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(pbExe, args, { cwd: pbDir, stdio: 'inherit', shell: false });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`pocketbase ${args.join(' ')} exited ${code}`));
    });
  });
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
    const err = new Error(`${method} ${urlPath} -> ${res.status}: ${text}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function field(def) {
  return { id: '', ...def };
}

/** PocketBase 0.23+ 建表不会自动带上；缺了会导致 sort=-created 返回 400 */
function autodateFields() {
  return [
    field({
      name: 'created',
      type: 'autodate',
      onCreate: true,
      onUpdate: false,
    }),
    field({
      name: 'updated',
      type: 'autodate',
      onCreate: true,
      onUpdate: true,
    }),
  ];
}

function withAutodates(payload) {
  const names = new Set((payload.fields || []).map((f) => f.name));
  const extra = autodateFields().filter((f) => !names.has(f.name));
  return { ...payload, fields: [...(payload.fields || []), ...extra] };
}

const adminOnly =
  '@request.auth.record.role = "admin" || @request.auth.role = "admin"';

async function ensureAutodates(token, col) {
  const names = new Set((col.fields || []).map((f) => f.name));
  const extra = autodateFields().filter((f) => !names.has(f.name));
  if (!extra.length) return false;
  await api(token, 'PATCH', `/api/collections/${col.id}`, {
    fields: [...col.fields, ...extra],
  });
  return true;
}

async function ensureCollection(token, payload) {
  const full = withAutodates(payload);
  try {
    const existing = await api(token, 'GET', `/api/collections/${payload.name}`);
    const patched = await ensureAutodates(token, existing);
    console.log(
      patched
        ? `  已存在集合 ${payload.name}，已补 created/updated`
        : `  已存在集合 ${payload.name}，跳过创建（如需重建请手动删）`,
    );
    return;
  } catch (e) {
    if (e.status !== 404) throw e;
  }
  await api(token, 'POST', '/api/collections', full);
  console.log(`  已创建集合 ${payload.name}`);
}

async function patchUsers(token) {
  const users = await api(token, 'GET', '/api/collections/users');
  const names = new Set((users.fields || []).map((f) => f.name));
  const extra = [];
  if (!names.has('role')) {
    extra.push(
      field({
        name: 'role',
        type: 'select',
        required: false,
        maxSelect: 1,
        values: ['user', 'admin'],
      }),
    );
  }
  if (!names.has('name')) {
    extra.push(field({ name: 'name', type: 'text', required: false }));
  }
  if (!names.has('avatar')) {
    extra.push(
      field({
        name: 'avatar',
        type: 'file',
        required: false,
        maxSelect: 1,
        maxSize: 2097152,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      }),
    );
  }

  const fields = [...(users.fields || []), ...extra];
  // 给 role 设置默认值（若字段已存在也尽量补）
  for (const f of fields) {
    if (f.name === 'role' && f.type === 'select') {
      f.values = ['user', 'admin'];
      f.maxSelect = 1;
    }
  }

  await api(token, 'PATCH', `/api/collections/${users.id}`, {
    listRule: `${adminOnly} || @request.auth.id = id`,
    viewRule: `${adminOnly} || @request.auth.id = id`,
    createRule: null,
    updateRule:
      '@request.auth.id = id && (@request.body.role:isset = false || @request.body.role = role)',
    deleteRule: '@request.auth.id = id',
    fields,
  });
  console.log('  已更新 users 字段与规则（关闭注册、禁止自改 role）');
}

async function ensureAppAdmin(token) {
  const list = await api(
    token,
    'GET',
    `/api/collections/users/records?filter=${encodeURIComponent(`email="${APP_ADMIN_EMAIL}"`)}`,
  );
  if (list.items?.length) {
    const id = list.items[0].id;
    await api(token, 'PATCH', `/api/collections/users/records/${id}`, {
      role: 'admin',
      password: APP_ADMIN_PASS,
      passwordConfirm: APP_ADMIN_PASS,
    });
    console.log(`  已更新 App admin: ${APP_ADMIN_EMAIL}`);
    return;
  }
  await api(token, 'POST', '/api/collections/users/records', {
    email: APP_ADMIN_EMAIL,
    password: APP_ADMIN_PASS,
    passwordConfirm: APP_ADMIN_PASS,
    role: 'admin',
    emailVisibility: true,
  });
  console.log(`  已创建 App admin: ${APP_ADMIN_EMAIL} / ${APP_ADMIN_PASS}`);
}

async function seedProducts(token) {
  const existing = await api(token, 'GET', '/api/collections/products/records?perPage=1');
  if (existing.totalItems > 0) {
    console.log('  已有商品，跳过种子数据');
    return;
  }
  const samples = [
    { title: '青梅酒', price: 68, description: '酸甜清爽，适合佐餐', stock: 50, category: '酒水', active: true },
    { title: '精酿啤酒', price: 18, description: '麦香浓郁，冰镇更佳', stock: 80, category: '啤酒', active: true },
    { title: '气泡水', price: 8, description: '无糖气泡，解腻清爽', stock: 100, category: '饮料', active: true },
  ];
  for (const p of samples) {
    await api(token, 'POST', '/api/collections/products/records', p);
  }
  console.log('  已写入 3 条酒水示例商品');
}

async function main() {
  console.log(`目标 PocketBase: ${PB_URL}`);
  const local = isLocalPocketBaseUrl(PB_URL);
  let healthy = await waitHealthy(2000);

  if (!healthy && local) {
    if (!existsSync(pbExe)) {
      throw new Error(`找不到 ${pbExe}，且 ${PB_URL} 未就绪`);
    }
    console.log('1) 创建/更新超级管理员…');
    await runCli(['superuser', 'upsert', SUPER_EMAIL, SUPER_PASS]);
    console.log('2) 启动 pocketbase serve…');
    const child = spawn(pbExe, ['serve'], { cwd: pbDir, stdio: 'ignore', detached: true });
    child.unref();
    healthy = await waitHealthy(20000);
    if (!healthy) {
      throw new Error('PocketBase 未能在 20s 内就绪');
    }
  } else if (!healthy) {
    throw new Error(`远端 PocketBase 未就绪: ${PB_URL}`);
  } else if (local && existsSync(pbExe)) {
    console.log('1) 创建/更新超级管理员…');
    await runCli(['superuser', 'upsert', SUPER_EMAIL, SUPER_PASS]);
    console.log('2) PocketBase 已在运行（本地）');
  } else {
    console.log('1) 跳过本地 CLI（远端实例）');
    console.log('2) PocketBase 已在运行');
  }

  console.log('3) 登录超级管理员…');
  const token = await authSuper();

  console.log('4) 配置 users…');
  await patchUsers(token);

  console.log('5) 创建业务集合…');

  await ensureCollection(token, {
    name: 'products',
    type: 'base',
    listRule: `active = true || ${adminOnly}`,
    viewRule: `active = true || ${adminOnly}`,
    createRule: adminOnly,
    updateRule: adminOnly,
    deleteRule: adminOnly,
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_products_active_created ON products (active, created)',
      'CREATE INDEX IF NOT EXISTS idx_products_category ON products (category)',
    ],
    fields: [
      field({ name: 'title', type: 'text', required: true }),
      field({ name: 'price', type: 'number', required: true }),
      field({ name: 'description', type: 'text' }),
      field({ name: 'stock', type: 'number' }),
      field({
        name: 'image',
        type: 'file',
        maxSelect: 1,
        maxSize: 2097152,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        thumbs: ['100x100', '400x400', '800x0'],
      }),
      field({
        name: 'category',
        type: 'select',
        maxSelect: 1,
        values: ['酒水', '啤酒', '饮料', '其它'],
      }),
      field({ name: 'active', type: 'bool' }),
    ],
  });

  console.log('6) App admin 用户…');
  await ensureAppAdmin(token);

  console.log('7) 示例商品…');
  await seedProducts(token);

  console.log('8) 收紧规则 / 店铺设置 / 清理未用集合…');
  const { hardenPocketBase } = await import('./harden-pocketbase.mjs');
  await hardenPocketBase(token);

  console.log('\n完成。');
  console.log(`  PocketBase: ${PB_URL}/_/`);
  console.log(`  超级管理员: ${SUPER_EMAIL} / ${SUPER_PASS}`);
  console.log(`  App admin: ${APP_ADMIN_EMAIL} / ${APP_ADMIN_PASS}`);
  console.log('  请确认 store0916/.env.local 中 PB_ADMIN_* / PB_SUPER_* 与上述一致。');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
