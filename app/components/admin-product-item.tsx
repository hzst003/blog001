'use client';

import Image from 'next/image';
import { useEffect, useState, type ReactNode } from 'react';

type Props = {
  title: string;
  category?: string;
  price: number;
  active?: boolean;
  thumbUrl?: string;
  children: ReactNode;
};

export function AdminProductItem({
  title,
  category,
  price,
  active,
  thumbUrl,
  children,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const sync = () => setOpen(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <li className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
      <details
        className="group"
        open={open}
        onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 p-3 sm:min-h-0 sm:cursor-default sm:p-4 [&::-webkit-details-marker]:hidden">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-24">
            {thumbUrl ? (
              <Image
                src={thumbUrl}
                alt={title}
                fill
                sizes="96px"
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-400">
                无图
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold text-slate-900">{title}</h3>
              <span
                className={
                  active
                    ? 'rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800'
                    : 'rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500'
                }
              >
                {active ? '上架' : '下架'}
              </span>
            </div>
            <p className="mt-0.5 text-sm tabular-nums text-slate-500">
              {category || '—'} · ¥{Number(price).toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-teal-700 sm:hidden">
              {open ? '点击收起' : '点击展开编辑'}
            </p>
          </div>
          <span
            className={`text-slate-400 transition sm:hidden ${open ? 'rotate-180' : ''}`}
            aria-hidden
          >
            ▾
          </span>
        </summary>
        {children}
      </details>
    </li>
  );
}
