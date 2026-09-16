import PocketBase from 'pocketbase';

/** 超级管理员客户端（用于修改 App 用户邮箱等受限操作） */
export async function getSuperPocketBase() {
  const url = process.env.POCKETBASE_URL;
  const email = process.env.PB_SUPER_EMAIL;
  const password = process.env.PB_SUPER_PASSWORD;
  if (!url) throw new Error('缺少 POCKETBASE_URL');
  if (!email || !password) {
    throw new Error('缺少 PB_SUPER_EMAIL 或 PB_SUPER_PASSWORD');
  }

  const pb = new PocketBase(url);
  await pb.collection('_superusers').authWithPassword(email, password);
  return pb;
}
