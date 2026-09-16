/**
 * 扩展分类为酒水/啤酒/饮料，并写入示例啤酒、饮料商品。
 *   node scripts/seed-beer-drinks.mjs
 */
const PB_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const SUPER_EMAIL = process.env.PB_SUPER_EMAIL || 'super@example.com';
const SUPER_PASS = process.env.PB_SUPER_PASSWORD || 'superadmin123456';

const CATEGORY_VALUES = ['酒水', '啤酒', '饮料', '其它', '食品', '数码', '服饰'];

const BEERS = [
  { title: '青岛啤酒', price: 8, description: '经典拉格，冰镇更佳' },
  { title: '雪花啤酒', price: 6, description: '清爽易饮' },
  { title: '精酿 IPA', price: 28, description: '花香苦韵，精酿风味' },
  { title: '黑啤', price: 18, description: '麦香浓郁' },
];

const DRINKS = [
  { title: '可乐', price: 5, description: '冰镇碳酸饮料' },
  { title: '雪碧', price: 5, description: '柠檬味汽水' },
  { title: '橙汁', price: 12, description: '鲜榨风味橙汁' },
  { title: '矿泉水', price: 3, description: '天然矿泉水' },
  { title: '酸梅汤', price: 10, description: '解腻开胃' },
  { title: '柠檬茶', price: 12, description: '清爽茶饮' },
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
    body: body ? JSON.stringify(body) : undefined,
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

async function ensureCategories(token) {
  const col = await api(token, 'GET', '/api/collections/products');
  const fields = (col.fields || []).map((f) => {
    if (f.name === 'category' && f.type === 'select') {
      return {
        ...f,
        maxSelect: 1,
        values: Array.from(new Set([...(f.values || []), ...CATEGORY_VALUES])),
      };
    }
    return f;
  });
  await api(token, 'PATCH', `/api/collections/${col.id}`, { fields });
  console.log('  已确保分类含：酒水 / 啤酒 / 饮料');
}

async function ensureProduct(token, { title, price, description, category }) {
  const filter = encodeURIComponent(`title="${title}"`);
  const list = await api(token, 'GET', `/api/collections/products/records?filter=${filter}&perPage=1`);
  if (list.items?.length) {
    const id = list.items[0].id;
    await api(token, 'PATCH', `/api/collections/products/records/${id}`, {
      category,
      price,
      description,
      active: true,
    });
    console.log(`  更新 ${title} → ${category}`);
    return;
  }
  await api(token, 'POST', '/api/collections/products/records', {
    title,
    price,
    description,
    category,
    stock: 50,
    active: true,
  });
  console.log(`  新增 ${title}（${category}）`);
}

async function main() {
  console.log('1) 登录…');
  const token = await authSuper();

  console.log('2) 更新分类字段…');
  await ensureCategories(token);

  console.log('3) 自酿啤酒归入啤酒…');
  await ensureProduct(token, {
    title: '自酿啤酒',
    price: 38,
    description: '店内自酿鲜啤',
    category: '啤酒',
  });

  console.log('4) 写入啤酒…');
  for (const p of BEERS) {
    await ensureProduct(token, { ...p, category: '啤酒' });
  }

  console.log('5) 写入饮料…');
  for (const p of DRINKS) {
    await ensureProduct(token, { ...p, category: '饮料' });
  }

  console.log('\n完成。刷新首页可按「啤酒 / 饮料」筛选；可在 /admin 补图。');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
