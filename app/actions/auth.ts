'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createPocketBase } from '@/lib/pocketbase';
import { getSuperPocketBase } from '@/lib/pocketbase-super';
import {
  clearAuthCookie,
  displayUsername,
  getAuthPocketBase,
  requireAdmin,
  saveAuthCookie,
  toAuthIdentity,
} from '@/lib/auth';

export type AuthActionState = {
  error?: string;
  ok?: boolean;
};

export async function login(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '');
  if (!username || !password) {
    return { error: '请输入用户名和密码' };
  }

  const candidates = [toAuthIdentity(username)];
  if (!username.includes('@')) {
    candidates.push(`${username}@local.admin`);
    candidates.push(username);
  } else {
    candidates.push(username);
  }

  const pb = createPocketBase();
  let ok = false;
  for (const identity of [...new Set(candidates)]) {
    try {
      await pb.collection('users').authWithPassword(identity, password);
      ok = true;
      break;
    } catch {
      /* try next */
    }
  }
  if (!ok) {
    return { error: '用户名或密码错误' };
  }

  const role = (pb.authStore.model as { role?: string } | null)?.role;
  if (role !== 'admin') {
    pb.authStore.clear();
    return { error: '该账号无管理权限' };
  }

  await saveAuthCookie(pb);
  redirect('/admin');
}

export async function logout() {
  await clearAuthCookie();
  redirect('/admin/login');
}

/** 自设用户名与密码（保存到 PocketBase，并刷新浏览器登录 Cookie） */
export async function updateAdminAccount(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const session = await requireAdmin();
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '');
  const passwordConfirm = String(formData.get('passwordConfirm') || '');
  const currentPassword = String(formData.get('currentPassword') || '');

  if (!username) {
    return { error: '请填写用户名' };
  }
  if (password && password.length < 8) {
    return { error: '密码至少 8 位' };
  }
  if (password && password !== passwordConfirm) {
    return { error: '两次密码不一致' };
  }

  const email = toAuthIdentity(username);
  const emailChanged = email.toLowerCase() !== session.email.toLowerCase();
  if ((password || emailChanged) && !currentPassword) {
    return { error: '请填写当前密码以确认修改' };
  }

  if (currentPassword) {
    const check = createPocketBase();
    try {
      await check.collection('users').authWithPassword(session.email, currentPassword);
    } catch {
      return { error: '当前密码不正确' };
    }
  }

  try {
    if (emailChanged) {
      const superPb = await getSuperPocketBase();
      await superPb.collection('users').update(session.userId, {
        email,
        name: displayUsername(email) || username,
        emailVisibility: true,
      });
    }

    if (password) {
      const pb = await getAuthPocketBase();
      if (emailChanged) {
        await pb.collection('users').authWithPassword(email, currentPassword);
        await saveAuthCookie(pb);
      }
      await pb.collection('users').update(session.userId, {
        oldPassword: currentPassword,
        password,
        passwordConfirm,
        name: displayUsername(email) || username,
      });
      await pb.collection('users').authWithPassword(email, password);
      await saveAuthCookie(pb);
    } else if (emailChanged) {
      const pb = createPocketBase();
      await pb.collection('users').authWithPassword(email, currentPassword);
      await saveAuthCookie(pb);
    } else {
      const pb = await getAuthPocketBase();
      await pb.collection('users').update(session.userId, {
        name: displayUsername(email) || username,
      });
      await pb.collection('users').authRefresh();
      await saveAuthCookie(pb);
    }
  } catch (e) {
    const anyErr = e as { message?: string; response?: { message?: string; data?: unknown } };
    const msg = [
      anyErr?.response?.message,
      JSON.stringify(anyErr?.response?.data || ''),
      anyErr?.message,
    ]
      .filter(Boolean)
      .join(' ');
    if (/unique|already|exists/i.test(msg)) {
      return { error: '该用户名已被占用' };
    }
    if (/password|oldPassword|invalid/i.test(msg)) {
      return { error: '当前密码不正确，或新密码不符合要求' };
    }
    return { error: `保存失败：${msg.slice(0, 160) || '未知错误'}` };
  }

  revalidatePath('/admin');
  redirect('/admin?account=1');
}
