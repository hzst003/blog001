/**
 * 创建 / 更新 store_settings 集合并写入默认店名与联系方式。
 *   node scripts/ensure-store-settings.mjs
 * 推荐直接使用：npm run harden:pb
 */
import { loadEnvLocal } from './load-env.mjs';

loadEnvLocal();

const PB_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const SUPER_EMAIL = process.env.PB_SUPER_EMAIL || 'super@example.com';
const SUPER_PASS = process.env.PB_SUPER_PASSWORD || 'superadmin123456';

const adminOnly =
  '@request.auth.record.role = "admin" || @request.auth.role = "admin"';

const DEFAULTS = {
  shop_name: '最简酒水店',
  phone: '138-0000-0000',
  address: '示例市示例路 88 号',
  hours: '10:00 – 22:00',
};

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
    throw err;
  }
  return data;
}

function field(def) {
  return { id: '', ...def };
}

async function main() {
  const token = await authSuper();

  let col;
  try {
    col = await api(token, 'GET', '/api/collections/store_settings');
    console.log('集合 store_settings 已存在');
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
        field({ name: 'shop_name', type: 'text', required: true }),
        field({ name: 'phone', type: 'text' }),
        field({ name: 'address', type: 'text' }),
        field({ name: 'hours', type: 'text' }),
        field({ name: 'created', type: 'autodate', onCreate: true, onUpdate: false }),
        field({ name: 'updated', type: 'autodate', onCreate: true, onUpdate: true }),
      ],
    });
    console.log('已创建集合 store_settings');
  }

  await api(token, 'PATCH', `/api/collections/${col.id}`, {
    listRule: '',
    viewRule: '',
    createRule: adminOnly,
    updateRule: adminOnly,
    deleteRule: adminOnly,
  });

  const list = await api(token, 'GET', '/api/collections/store_settings/records?perPage=1');
  if (list.items?.length) {
    console.log('已有店铺信息，跳过种子：', list.items[0].shop_name);
  } else {
    await api(token, 'POST', '/api/collections/store_settings/records', DEFAULTS);
    console.log('已写入默认店名与联系方式');
  }

  console.log('完成。可在 /admin 修改。');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
