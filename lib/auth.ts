import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PocketBase from 'pocketbase';
import { createPocketBase } from '@/lib/pocketbase';

export const AUTH_COOKIE = 'pb_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 天，浏览器自动保存登录

export type AdminSession = {
  userId: string;
  email: string;
  username: string;
  role: string;
};

/** 自定义用户名 → PocketBase 邮箱身份（无 @ 时自动补全） */
export function toAuthIdentity(username: string) {
  const u = username.trim();
  if (!u) return '';
  if (u.includes('@')) return u.toLowerCase();
  const safe = u.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${safe}@local.test`;
}

export function displayUsername(email?: string | null) {
  if (!email) return '';
  if (email.endsWith('@local.test')) {
    return email.slice(0, -'@local.test'.length);
  }
  // 兼容旧版 @local.admin
  if (email.endsWith('@local.admin')) {
    return email.slice(0, -'@local.admin'.length);
  }
  return email;
}

export async function saveAuthCookie(pb: PocketBase) {
  const store = await cookies();
  store.set(
    AUTH_COOKIE,
    JSON.stringify({ token: pb.authStore.token, model: pb.authStore.model }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    },
  );
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}

export async function getAuthPocketBase() {
  const pb = createPocketBase();
  const store = await cookies();
  const raw = store.get(AUTH_COOKIE)?.value;
  if (!raw) return pb;

  try {
    const { token, model } = JSON.parse(raw);
    pb.authStore.save(token, model);
    if (pb.authStore.isValid) {
      try {
        await pb.collection('users').authRefresh();
      } catch {
        pb.authStore.clear();
        try {
          await clearAuthCookie();
        } catch {
          // RSC 中无法写 Cookie；由 requireAdmin 转到 /admin/session-clear
        }
        return pb;
      }
      // 刷新成功后尽量写回 Cookie；RSC 渲染阶段不能 set cookie，忽略即可
      try {
        await saveAuthCookie(pb);
      } catch {
        /* keep in-memory authStore for this request */
      }
    }
  } catch {
    pb.authStore.clear();
  }
  return pb;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const pb = await getAuthPocketBase();
  const model = pb.authStore.model as
    | { id?: string; email?: string; role?: string }
    | null;
  if (!pb.authStore.isValid || !model?.id) return null;
  if (model.role !== 'admin') return null;
  return {
    userId: model.id,
    email: model.email || '',
    username: displayUsername(model.email),
    role: model.role,
  };
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/session-clear');
  }
  return session;
}
