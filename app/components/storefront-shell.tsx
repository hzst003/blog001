'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { CategoryFilters } from '@/app/components/category-filters';
import { ProductGallery, type GalleryProduct } from '@/app/components/product-gallery';

export function StorefrontShell({
  shopName,
  products,
  hero,
  footer,
  contactTel,
  contactPhone,
}: {
  shopName: string;
  products: GalleryProduct[];
  hero: ReactNode;
  footer: ReactNode;
  contactTel?: string;
  contactPhone?: string;
}) {
  const [filter, setFilter] = useState('全部');
  const [items, setItems] = useState(products);

  useEffect(() => {
    setItems(products);
  }, [products]);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const res = await fetch(`/api/products?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { Pragma: 'no-cache' },
        });
        if (!res.ok) return;
        const data = (await res.json()) as { products?: GalleryProduct[] };
        if (!cancelled && Array.isArray(data.products)) {
          setItems(data.products);
        }
      } catch {
        /* keep current list */
      }
    }

    function onShow() {
      if (document.visibilityState === 'visible') refresh();
    }

    refresh();
    document.addEventListener('visibilitychange', onShow);
    window.addEventListener('pageshow', onShow);
    window.addEventListener('focus', onShow);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onShow);
      window.removeEventListener('pageshow', onShow);
      window.removeEventListener('focus', onShow);
    };
  }, []);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 shadow-[0_4px_18px_rgba(15,23,42,0.06)] backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto max-w-5xl pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4 sm:pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-center gap-3 px-3 py-2.5 sm:px-0 sm:py-4">
            <h1 className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight text-teal-800 sm:text-xl">
              {shopName}
            </h1>
            <a
              href="/admin"
              className="inline-flex min-h-9 shrink-0 items-center text-xs font-medium text-slate-400 sm:hidden"
            >
              管理
            </a>
          </div>
          <div className="relative pb-2 sm:hidden">
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent" />
            <CategoryFilters value={filter} onChange={setFilter} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-3 pb-28 sm:px-4 sm:py-10 sm:pb-10">
        {hero}
        <div className="mb-4 hidden sm:mb-6 sm:block">
          <CategoryFilters value={filter} onChange={setFilter} />
        </div>
        <ProductGallery
          products={items}
          filter={filter}
          onFilterChange={setFilter}
          hideFilters
          contactTel={contactTel}
          contactPhone={contactPhone}
        />
      </main>

      {footer}
    </div>
  );
}
