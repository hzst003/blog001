'use client';

import { useState, type ReactNode } from 'react';
import { CategoryFilters } from '@/app/components/category-filters';
import { ProductGallery, type GalleryProduct } from '@/app/components/product-gallery';

export function StorefrontShell({
  shopName,
  products,
  hero,
  footer,
}: {
  shopName: string;
  products: GalleryProduct[];
  hero: ReactNode;
  footer: ReactNode;
}) {
  const [filter, setFilter] = useState('全部');

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto max-w-5xl pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4 sm:pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-center px-3 py-2.5 sm:px-0 sm:py-4">
            <h1 className="min-w-0 truncate text-base font-semibold tracking-tight text-teal-800 sm:text-xl">
              {shopName}
            </h1>
          </div>
          <div className="pb-2 sm:hidden">
            <CategoryFilters value={filter} onChange={setFilter} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-3 pb-20 sm:px-4 sm:py-10 sm:pb-10">
        {hero}
        <div className="mb-4 hidden sm:mb-6 sm:block">
          <CategoryFilters value={filter} onChange={setFilter} />
        </div>
        <ProductGallery
          products={products}
          filter={filter}
          onFilterChange={setFilter}
          hideFilters
        />
      </main>

      {footer}
    </div>
  );
}
