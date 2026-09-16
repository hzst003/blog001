import { getAuthPocketBase, requireAdmin } from '@/lib/auth';

/** 使用浏览器已保存的登录会话写入 PocketBase（需管理员） */
export async function getAdminPocketBase() {
  await requireAdmin();
  return getAuthPocketBase();
}
