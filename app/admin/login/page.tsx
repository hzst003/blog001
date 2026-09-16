import Link from 'next/link';
import { getAdminSession } from '@/lib/auth';
import { LoginForm } from '@/app/components/login-form';
import { redirect } from 'next/navigation';

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect('/admin');
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">管理登录</h1>
        <p className="mt-1 text-sm text-slate-500">输入用户名与密码进入店铺管理</p>
        <LoginForm />
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-teal-700 hover:underline">
            返回首页
          </Link>
        </p>
      </div>
    </main>
  );
}
