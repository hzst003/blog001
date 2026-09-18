'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CategoryFilters } from '@/app/components/category-filters';

export type GalleryProduct = {
  id: string;
  title: string;
  price: number;
  description?: string;
  category?: string;
  thumbUrl?: string;
  imageUrl?: string;
};

type Props = {
  products: GalleryProduct[];
  filter?: string;
  onFilterChange?: (value: string) => void;
  /** 分类条已由外层渲染时隐藏 */
  hideFilters?: boolean;
  contactTel?: string;
  contactPhone?: string;
};

export function ProductGallery({
  products,
  filter: controlledFilter,
  onFilterChange,
  hideFilters = false,
  contactTel,
  contactPhone,
}: Props) {
  const [internalFilter, setInternalFilter] = useState('全部');
  const filter = controlledFilter ?? internalFilter;
  const setFilter = onFilterChange ?? setInternalFilter;

  const [active, setActive] = useState<GalleryProduct | null>(null);
  const [mounted, setMounted] = useState(false);
  const touchStartY = useRef<number | null>(null);

  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visible = useMemo(() => {
    if (filter === '全部') return products;
    return products.filter((p) => p.category === filter);
  }, [products, filter]);

  useEffect(() => {
    if (!active) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [active, close]);

  return (
    <>
      {!hideFilters ? (
        <div className="-mx-3 mb-4 px-3 sm:mx-0 sm:mb-6 sm:px-0">
          <CategoryFilters value={filter} onChange={setFilter} />
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">该分类暂无商品</p>
      ) : (
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
          {visible.map((p, index) => {
            const listSrc = p.thumbUrl || p.imageUrl;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setActive(p)}
                  className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition duration-200 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)] active:translate-y-0 active:scale-[0.98] active:bg-slate-50 sm:rounded-2xl"
                  aria-label={`查看${p.title}`}
                >
                  {listSrc ? (
                    <span className="relative block aspect-square w-full overflow-hidden bg-slate-50 sm:aspect-[4/3]">
                      <Image
                        src={listSrc}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
                        unoptimized
                        priority={index < 6}
                        className="object-cover transition duration-300 ease-out group-hover:scale-105"
                      />
                    </span>
                  ) : (
                    <span className="flex aspect-square w-full items-center justify-center bg-slate-100 text-xs text-slate-400 sm:aspect-[4/3] sm:text-sm">
                      暂无图片
                    </span>
                  )}
                  <span className="flex flex-1 flex-col p-2.5 sm:p-4">
                    <span className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 sm:text-base">
                      {p.title}
                    </span>
                    {p.category ? (
                      <span className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-sm">
                        {p.category}
                      </span>
                    ) : null}
                    <span className="mt-auto pt-1 text-base font-semibold tabular-nums text-teal-800 sm:mt-1.5 sm:pt-0 sm:text-lg">
                      ¥{Number(p.price).toFixed(2)}
                    </span>
                    {p.description ? (
                      <span className="mt-1 hidden text-sm text-slate-500 sm:line-clamp-2 sm:block">
                        {p.description}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {active && mounted
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${active.title}详情`}
              className="fixed inset-0 z-[100] flex flex-col overscroll-none bg-black"
              onClick={close}
              onTouchStart={(e) => {
                touchStartY.current = e.touches[0]?.clientY ?? null;
              }}
              onTouchEnd={(e) => {
                const start = touchStartY.current;
                touchStartY.current = null;
                if (start == null) return;
                const end = e.changedTouches[0]?.clientY;
                if (end != null && end - start > 80) close();
              }}
            >
              <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] text-white sm:px-5">
                <div className="min-w-0">
                  <p className="truncate text-base font-medium sm:text-lg">{active.title}</p>
                  <p className="text-sm tabular-nums text-white/70">
                    ¥{Number(active.price).toFixed(2)}
                    {active.category ? ` · ${active.category}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white active:bg-white/25"
                  aria-label="关闭"
                >
                  ×
                </button>
              </div>

              <div
                className="flex min-h-0 flex-1 touch-pan-y items-center justify-center px-3 sm:px-6"
                onClick={(e) => e.stopPropagation()}
              >
                {active.imageUrl || active.thumbUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={active.imageUrl || active.thumbUrl}
                    alt={active.title}
                    className="h-auto max-h-[min(62dvh,calc(100dvh-12rem))] w-auto max-w-full select-none object-contain sm:max-h-full"
                    draggable={false}
                  />
                ) : (
                  <p className="text-sm text-white/60">暂无图片</p>
                )}
              </div>

              <div className="space-y-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 text-center sm:space-y-2 sm:pb-6">
                {active.description ? (
                  <p className="mx-auto max-w-lg text-sm leading-relaxed text-white/75">
                    {active.description}
                  </p>
                ) : null}
                {contactTel ? (
                  <a
                    href={contactTel}
                    onClick={(e) => e.stopPropagation()}
                    className="ui-btn mx-auto w-full max-w-xs sm:w-auto"
                  >
                    打电话{contactPhone ? ` ${contactPhone}` : ''}
                  </a>
                ) : null}
                <p className="text-xs text-white/40 sm:hidden">下滑关闭</p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
