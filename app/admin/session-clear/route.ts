import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

/** 清除失效会话后跳转登录（可在 Route Handler 中写 Cookie） */
export async function GET(request: Request) {
  await clearAuthCookie();
  return NextResponse.redirect(new URL('/admin/login', request.url));
}
