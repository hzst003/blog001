import type { Metadata } from 'next';
import { getPocketBase } from '@/lib/pocketbase';
import { StorefrontShell } from '@/app/components/storefront-shell';
import type { GalleryProduct } from '@/app/components/product-gallery';
import { getStoreSettings, phoneToTel } from '@/lib/store-settings';
import { productThumbUrl, productViewUrl } from '@/lib/product-images';
import type { Product } from '@/lib/types';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  return {
    title: settings.shop_name,
    description: `${settings.shop_name}商品展示`,
  };
}

export default async function HomePage() {
  const pb = await getPocketBase();
  const settings = await getStoreSettings();
  const tel = phoneToTel(settings.phone);

  let products: Product[] = [];
  let loadError = false;
  try {
    products = await pb.collection('products').getFullList<Product>({
      filter: 'active = true',
      sort: '-created',
    });
  } catch (err) {
    console.error('[HomePage] products', err);
    try {
      products = await pb.collection('products').getFullList<Product>({
        filter: 'active = true',
        sort: '-id',
      });
    } catch (err2) {
      console.error('[HomePage] products fallback', err2);
      products = [];
      loadError = true;
    }
  }

  const galleryItems: GalleryProduct[] = products.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    description: p.description,
    category: p.category,
    thumbUrl: productThumbUrl(pb, p),
    imageUrl: productViewUrl(pb, p),
  }));

  const hero = (
    <section key="storefront-hero" className="mb-3 text-center sm:mb-8">
      <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-2xl">精选商品</h2>
      <p className="mt-0.5 text-xs text-slate-500 sm:mt-1 sm:text-sm">酒水 · 啤酒 · 饮料</p>
      {loadError ? (
        <p className="mt-6 text-sm text-slate-400 sm:mt-8">商品加载失败，请稍后重试</p>
      ) : galleryItems.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400 sm:mt-8">暂无上架商品</p>
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

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/90 sm:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-5xl items-center gap-2 text-xs leading-snug text-slate-600">
          <span className="min-w-0 truncate tabular-nums text-slate-500">
            营业时间：{settings.hours}
          </span>
          <a
            href="/admin"
            className="ml-auto inline-flex min-h-9 shrink-0 items-center rounded-lg bg-teal-700 px-3 text-sm font-medium text-white"
          >
            商品管理
          </a>
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
    />
  );
}
