'use client';

import { useEffect, useRef } from 'react';
import { CATEGORY_FILTERS } from '@/lib/categories';

export function CategoryFilters({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // display:none 的分类条（电脑版在手机上隐藏）不要滚进视口
    if (root.offsetParent === null && getComputedStyle(root).position === 'static') return;
    const selected = root.querySelector<HTMLElement>('[data-selected="true"]');
    selected?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [value]);

  return (
    <div
      ref={rootRef}
      className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto overscroll-x-contain scroll-smooth px-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:snap-none sm:flex-wrap sm:gap-2 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {CATEGORY_FILTERS.map((c) => {
        const selected = value === c;
        return (
          <button
            key={c}
            type="button"
            data-selected={selected ? 'true' : undefined}
            onClick={() => onChange(c)}
            className={
              selected
                ? 'min-h-9 shrink-0 snap-start rounded-full bg-teal-700 px-3.5 py-1.5 text-sm font-medium text-white shadow-md shadow-teal-700/20 sm:min-h-10 sm:px-4 sm:py-2'
                : 'min-h-9 shrink-0 snap-start rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:translate-y-0 active:bg-slate-100 sm:min-h-10 sm:px-4 sm:py-2'
            }
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
