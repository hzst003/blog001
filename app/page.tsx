import type { Metadata } from 'next';
import { StorefrontShell } from '@/app/components/storefront-shell';
import { getActiveGalleryProducts } from '@/lib/catalog';
import { getStoreSettings, phoneToTel } from '@/lib/store-settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  return {
    title: settings.shop_name,
    description: `${settings.shop_name}商品展示`,
  };
}

export default async function HomePage() {
  const settings = await getStoreSettings();
  const tel = phoneToTel(settings.phone);
  const { products: galleryItems, loadError } = await getActiveGalleryProducts();

  const hero = (
    <section key="storefront-hero" className="text-center">
      <div className="mb-8 hidden sm:block">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-2xl">精选商品</h2>
        <p className="mt-1 text-sm text-slate-500">酒水 · 啤酒 · 饮料</p>
      </div>
      {loadError ? (
        <p className="mb-4 text-sm text-slate-400 sm:mb-0 sm:mt-8">商品加载失败，请稍后重试</p>
      ) : galleryItems.length === 0 ? (
        <p className="mb-4 text-sm text-slate-400 sm:mb-0 sm:mt-8">暂无上架商品</p>
      ) : null}
    </section>
  );

  const footer = (
    <div key="storefront-footer" className="mt-auto">
      <footer className="hidden border-t border-slate-200 bg-white sm:block">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center text-sm text-slate-500">
          <p className="font-medium text-slate-700">联系我们</p>
          <p className="mt-2">
            {tel ? (
              <a href={tel} className="text-teal-800 hover:underline">
                电话：{settings.phone}
              </a>
            ) : (
              <>电话：{settings.phone}</>
            )}
          </p>
          <p className="mt-1">地址：{settings.address}</p>
          <p className="mt-1">营业时间：{settings.hours}</p>
          <p className="mt-4">
            <a href="/admin" className="text-teal-700 hover:underline">
              商品管理
            </a>
          </p>
        </div>
      </footer>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden">
        <div className="pointer-events-auto mx-auto flex max-w-5xl items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-2.5 shadow-[0_10px_32px_rgba(15,23,42,0.16)] backdrop-blur supports-[backdrop-filter]:bg-white/90">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">{settings.address}</p>
            <p className="truncate text-xs tabular-nums text-slate-500">营业 {settings.hours}</p>
          </div>
          {tel ? (
            <a href={tel} className="ui-btn shrink-0 px-5 shadow-md shadow-teal-700/25">
              打电话
            </a>
          ) : (
            <a href="/admin" className="ui-btn shrink-0 px-5 shadow-md shadow-teal-700/25">
              商品管理
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <StorefrontShell
      shopName={settings.shop_name}
      products={loadError ? [] : galleryItems}
      hero={hero}
      footer={footer}
      contactTel={tel}
      contactPhone={settings.phone}
    />
  );
}
