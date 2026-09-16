'use client';

import { useActionState } from 'react';
import { login, type AuthActionState } from '@/app/actions/auth';

const initial: AuthActionState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <form action={action} className="mt-6 space-y-4">
      {state.error ? <p className="ui-alert-error">{state.error}</p> : null}
      <div>
        <label className="ui-label" htmlFor="username">
          用户名
        </label>
        <input
          id="username"
          name="username"
          required
          autoComplete="username"
          className="ui-input"
          placeholder="可自设，如 shop 或邮箱"
          defaultValue="admin@example.com"
        />
      </div>
      <div>
        <label className="ui-label" htmlFor="password">
          密码
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="ui-input"
          placeholder="密码"
        />
      </div>
      <button type="submit" className="ui-btn w-full" disabled={pending}>
        {pending ? '登录中…' : '登录'}
      </button>
      <p className="text-center text-xs text-slate-400">
        登录成功后浏览器自动保持约 7 天。可在管理页自设用户名与密码。
      </p>
    </form>
  );
}
