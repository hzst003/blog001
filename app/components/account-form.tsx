'use client';

import { useActionState } from 'react';
import { updateAdminAccount, type AuthActionState } from '@/app/actions/auth';

const initial: AuthActionState = {};

export function AccountForm({ username }: { username: string }) {
  const [state, action, pending] = useActionState(updateAdminAccount, initial);

  return (
    <form action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
      {state.error ? (
        <p className="ui-alert-error sm:col-span-2">{state.error}</p>
      ) : null}
      <div className="sm:col-span-2">
        <label className="ui-label" htmlFor="username">
          用户名
        </label>
        <input
          id="username"
          name="username"
          required
          className="ui-input"
          defaultValue={username}
          placeholder="自定义用户名或邮箱"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="ui-label" htmlFor="currentPassword">
          当前密码
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          className="ui-input"
          placeholder="改用户名或密码时必填"
        />
      </div>
      <div>
        <label className="ui-label" htmlFor="password">
          新密码
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className="ui-input"
          placeholder="不改请留空，至少 8 位"
        />
      </div>
      <div>
        <label className="ui-label" htmlFor="passwordConfirm">
          确认新密码
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          className="ui-input"
          placeholder="再次输入新密码"
        />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" className="ui-btn w-full sm:w-auto" disabled={pending}>
          {pending ? '保存中…' : '保存账号'}
        </button>
      </div>
    </form>
  );
}
