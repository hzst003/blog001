/**
 * 收紧 PocketBase 规则、对齐酒水分类、配置缩略图与索引、清理未用集合。
 * 可单独运行，也会被 setup:pb 调用。
 *   node scripts/harden-pocketbase.mjs
 */
import { loadEnvLocal } from './load-env.mjs';

loadEnvLocal();

const PB_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const SUPER_EMAIL = process.env.PB_SUPER_EMAIL || 'super@example.com';
const SUPER_PASS = process.env.PB_SUPER_PASSWORD || 'superadmin123456';

const adminOnly =
  '@request.auth.record.role = "admin" || @request.auth.role = "admin"';
const productsPublicOrAdmin = `active = true || ${adminOnly}`;
/** 本人可改自身，但不可改 role */
const selfUpdateNoRole =
  '@request.auth.id = id && (@request.body.role:isset = false || @request.body.role = role)';

const PRODUCT_CATEGORIES = ['酒水', '啤酒', '饮料', '其它'];
const LEGACY_CATEGORIES = ['数码', '服饰', '食品'];
const UNUSED_COLLECTIONS = [
  'user_coupons',
  'reviews',
  'favorites',
  'cart_items',
  'addresses',
  'orders',
  'coupons',
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
  if (!res.ok) {
    const err = new Error(`${method} ${urlPath} -> ${res.status}: ${text}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

async function hardenUsers(token) {
  const users = await api(token, 'GET', '/api/collections/users');
  await api(token, 'PATCH', `/api/collections/${users.id}`, {
    listRule: `${adminOnly} || @request.auth.id = id`,
    viewRule: `${adminOnly} || @request.auth.id = id`,
    createRule: null,
    updateRule: selfUpdateNoRole,
    deleteRule: '@request.auth.id = id',
  });
  console.log('  users：关闭公开注册，禁止自改 role');
}

async function remapLegacyCategories(token) {
  for (const cat of LEGACY_CATEGORIES) {
    const list = await api(
      token,
      'GET',
      `/api/collections/products/records?perPage=200&filter=${encodeURIComponent(`category="${cat}"`)}`,
    );
    for (const row of list.items || []) {
      await api(token, 'PATCH', `/api/collections/products/records/${row.id}`, {
        category: '其它',
      });
    }
    if (list.items?.length) {
      console.log(`  已将 ${list.items.length} 条「${cat}」归为「其它」`);
    }
  }
}

async function hardenProducts(token) {
  await remapLegacyCategories(token);

  const col = await api(token, 'GET', '/api/collections/products');
  const fields = (col.fields || []).map((f) => {
    if (f.name === 'category' && f.type === 'select') {
      return { ...f, values: [...PRODUCT_CATEGORIES], maxSelect: 1 };
    }
    if (f.name === 'image' && f.type === 'file') {
      return {
        ...f,
        thumbs: ['100x100', '400x400', '800x0'],
        maxSelect: 1,
        maxSize: 2097152,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      };
    }
    return f;
  });

  await api(token, 'PATCH', `/api/collections/${col.id}`, {
    listRule: productsPublicOrAdmin,
    viewRule: productsPublicOrAdmin,
    createRule: adminOnly,
    updateRule: adminOnly,
    deleteRule: adminOnly,
    fields,
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_products_active_created ON products (active, created)',
      'CREATE INDEX IF NOT EXISTS idx_products_category ON products (category)',
    ],
  });
  console.log('  products：公开仅 active=true；分类/缩略图/索引已对齐');
}

async function hardenStoreSettings(token) {
  let col;
  try {
    col = await api(token, 'GET', '/api/collections/store_settings');
  } catch (e) {
    if (e.status !== 404) throw e;
    col = await api(token, 'POST', '/api/collections', {
      name: 'store_settings',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: adminOnly,
      updateRule: adminOnly,
      deleteRule: adminOnly,
      fields: [
        { id: '', name: 'shop_name', type: 'text', required: true },
        { id: '', name: 'phone', type: 'text' },
        { id: '', name: 'address', type: 'text' },
        { id: '', name: 'hours', type: 'text' },
        { id: '', name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { id: '', name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    });
    console.log('  已创建 store_settings');
  }

  await api(token, 'PATCH', `/api/collections/${col.id}`, {
    listRule: '',
    viewRule: '',
    createRule: adminOnly,
    updateRule: adminOnly,
    deleteRule: adminOnly,
  });

  const list = await api(token, 'GET', '/api/collections/store_settings/records?perPage=1');
  if (!list.items?.length) {
    await api(token, 'POST', '/api/collections/store_settings/records', {
      shop_name: '最简酒水店',
      phone: '138-0000-0000',
      address: '示例市示例路 88 号',
      hours: '10:00 – 22:00',
    });
    console.log('  已写入默认店铺信息');
  } else {
    console.log('  store_settings 已就绪');
  }
}

async function removeUnusedCollections(token) {
  for (const name of UNUSED_COLLECTIONS) {
    try {
      const col = await api(token, 'GET', `/api/collections/${name}`);
      await api(token, 'DELETE', `/api/collections/${col.id}`);
      console.log(`  已删除未用集合 ${name}`);
    } catch (e) {
      if (e.status === 404) continue;
      console.warn(`  删除 ${name} 失败:`, e.message);
    }
  }
}

export async function hardenPocketBase(token) {
  console.log('harden) users…');
  await hardenUsers(token);
  console.log('harden) products…');
  await hardenProducts(token);
  console.log('harden) store_settings…');
  await hardenStoreSettings(token);
  console.log('harden) 清理未用集合…');
  await removeUnusedCollections(token);
}

async function main() {
  const token = await authSuper();
  await hardenPocketBase(token);
  console.log('harden 完成。');
}

const isDirect =
  process.argv[1] &&
  (process.argv[1].endsWith('harden-pocketbase.mjs') ||
    process.argv[1].includes('harden-pocketbase'));

if (isDirect) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
