import Link from 'next/link';
import { AccountForm } from '@/app/components/account-form';
import { AdminProductItem } from '@/app/components/admin-product-item';
import { CompressImageForm } from '@/app/components/compress-image-form';
import { ImageUploadField } from '@/app/components/image-upload-field';
import { DeleteProductButton } from '@/app/components/delete-product-button';
import { PRODUCT_CATEGORIES } from '@/lib/categories';
import { getStoreSettings } from '@/lib/store-settings';
import { requireAdmin } from '@/lib/auth';
import { getAdminPocketBase } from '@/lib/pocketbase-admin';
import { productAdminThumbUrl } from '@/lib/product-images';
import type { Product } from '@/lib/types';
import { logout } from '@/app/actions/auth';
import { updateStoreSettings } from '@/app/actions/settings';
import {
  createProduct,
  updateProduct,
  updateProductImage,
} from '@/app/actions/products';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    created?: string;
    settings?: string;
    account?: string;
  }>;
}) {
  const session = await requireAdmin();
  const { created, settings: settingsSaved, account } = await searchParams;
  const pb = await getAdminPocketBase();
  const store = await getStoreSettings();

  let products: Product[] = [];
  try {
    products = await pb.collection('products').getFullList<Product>({
      sort: '-created',
    });
  } catch (err) {
    console.error('[AdminPage] products', err);
    products = [];
  }

  return (
    <div className="mx-auto min-h-full w-full max-w-4xl px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-8">
      <div className="sticky top-0 z-30 -mx-3 mb-4 border-b border-slate-200 bg-white/95 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur supports-[backdrop-filter]:bg-white/90 sm:static sm:z-auto sm:mx-0 sm:mb-6 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:pt-0 sm:backdrop-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              店铺管理
            </h1>
            <p className="ui-page-desc">
              已登录：{session.username}
              <span className="hidden text-slate-400 sm:inline">（登录状态已保存在浏览器）</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-row">
            <Link href="/" className="ui-btn-ghost w-full sm:w-auto">
              返回首页
            </Link>
            <form action={logout} className="w-full sm:w-auto">
              <button type="submit" className="ui-btn-ghost w-full sm:w-auto">
                退出登录
              </button>
            </form>
          </div>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden">
          <a href="#store" className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
            店铺
          </a>
          <a href="#account" className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
            账号
          </a>
          <a href="#new" className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
            新增
          </a>
          <a href="#products" className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
            商品
          </a>
        </nav>
      </div>

      {created ? <p className="ui-alert-success mb-6">商品已新增</p> : null}
      {settingsSaved ? <p className="ui-alert-success mb-6">店铺信息已保存</p> : null}
      {account ? <p className="ui-alert-success mb-6">账号已更新</p> : null}

      <section id="store" className="mb-6 scroll-mt-36 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-8 sm:scroll-mt-0 sm:rounded-2xl sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">店名与联系我们</h2>
        <form action={updateStoreSettings} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="ui-label" htmlFor="shop_name">
              店名
            </label>
            <input
              id="shop_name"
              name="shop_name"
              required
              className="ui-input"
              defaultValue={store.shop_name}
              placeholder="最简酒水店"
            />
          </div>
          <div>
            <label className="ui-label" htmlFor="phone">
              电话
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              className="ui-input"
              defaultValue={store.phone}
              placeholder="138-0000-0000"
            />
          </div>
          <div>
            <label className="ui-label" htmlFor="hours">
              营业时间
            </label>
            <input
              id="hours"
              name="hours"
              className="ui-input"
              defaultValue={store.hours}
              placeholder="10:00 – 22:00"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="ui-label" htmlFor="address">
              地址
            </label>
            <input
              id="address"
              name="address"
              className="ui-input"
              defaultValue={store.address}
              placeholder="示例市示例路 88 号"
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="ui-btn w-full sm:w-auto">
              保存店铺信息
            </button>
          </div>
        </form>
      </section>

      <section id="account" className="mb-6 scroll-mt-36 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-8 sm:scroll-mt-0 sm:rounded-2xl sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">账号设置</h2>
        <p className="mt-1 text-sm text-slate-500">修改登录用户名或密码</p>
        <AccountForm username={session.username} />
      </section>

      <section id="new" className="mb-6 scroll-mt-36 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-8 sm:scroll-mt-0 sm:rounded-2xl sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">新增商品</h2>
        <CompressImageForm action={createProduct} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="ui-label" htmlFor="title">
              名称
            </label>
            <input id="title" name="title" required className="ui-input" placeholder="例如：青梅酒" />
          </div>
          <div>
            <label className="ui-label" htmlFor="price">
              价格（元）
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              className="ui-input"
              placeholder="68"
            />
          </div>
          <div>
            <label className="ui-label" htmlFor="category">
              分类
            </label>
            <select id="category" name="category" defaultValue="酒水" className="ui-input">
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="ui-label" htmlFor="description">
              简介
            </label>
            <input
              id="description"
              name="description"
              className="ui-input"
              placeholder="可选"
            />
          </div>
          <div className="sm:col-span-2">
            <ImageUploadField id="image" label="图片" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="ui-btn w-full sm:w-auto">
              新增商品
            </button>
          </div>
        </CompressImageForm>
      </section>

      <section id="products" className="scroll-mt-36 sm:scroll-mt-0">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          已有商品（{products.length}）
        </h2>
        {products.length === 0 ? (
          <p className="text-sm text-slate-400">暂无商品</p>
        ) : (
          <ul className="space-y-3 sm:space-y-4">
            {products.map((p) => {
              const thumb = productAdminThumbUrl(pb, p);
              return (
                <AdminProductItem
                  key={p.id}
                  title={p.title}
                  category={p.category}
                  price={Number(p.price)}
                  active={Boolean(p.active)}
                  thumbUrl={thumb}
                >
                  <div className="space-y-3 border-t border-slate-100 p-3 pt-3 sm:flex sm:items-start sm:gap-4 sm:border-0 sm:p-4 sm:pt-0">
                    <div className="min-w-0 flex-1 space-y-3">
                      <form action={updateProduct} className="grid gap-3 sm:grid-cols-2">
                        <input type="hidden" name="id" value={p.id} />
                        <div className="sm:col-span-2">
                          <label className="ui-label" htmlFor={`title-${p.id}`}>
                            名称
                          </label>
                          <input
                            id={`title-${p.id}`}
                            name="title"
                            required
                            defaultValue={p.title}
                            className="ui-input"
                          />
                        </div>
                        <div>
                          <label className="ui-label" htmlFor={`price-${p.id}`}>
                            价格
                          </label>
                          <input
                            id={`price-${p.id}`}
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            defaultValue={Number(p.price)}
                            className="ui-input"
                          />
                        </div>
                        <div>
                          <label className="ui-label" htmlFor={`category-${p.id}`}>
                            分类
                          </label>
                          <select
                            id={`category-${p.id}`}
                            name="category"
                            defaultValue={
                              (PRODUCT_CATEGORIES as readonly string[]).includes(p.category || '')
                                ? p.category
                                : '其它'
                            }
                            className="ui-input"
                          >
                            {PRODUCT_CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="ui-label" htmlFor={`description-${p.id}`}>
                            简介
                          </label>
                          <input
                            id={`description-${p.id}`}
                            name="description"
                            defaultValue={p.description || ''}
                            className="ui-input"
                          />
                        </div>
                        <div className="flex min-h-11 items-center gap-3 sm:col-span-2">
                          <input
                            id={`active-${p.id}`}
                            name="active"
                            type="checkbox"
                            value="true"
                            defaultChecked={Boolean(p.active)}
                            className="h-5 w-5 rounded border-slate-300 text-teal-700"
                          />
                          <label htmlFor={`active-${p.id}`} className="text-sm text-slate-700">
                            上架（前台可见）
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <button type="submit" className="ui-btn w-full sm:w-auto">
                            保存信息
                          </button>
                        </div>
                      </form>

                      <CompressImageForm
                        action={updateProductImage}
                        requireImage
                        className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end"
                      >
                        <input type="hidden" name="id" value={p.id} />
                        <div className="min-w-0 flex-1">
                          <ImageUploadField id={`image-${p.id}`} required label="更换图片" />
                        </div>
                        <button type="submit" className="ui-btn-ghost w-full sm:w-auto">
                          上传
                        </button>
                      </CompressImageForm>
                    </div>

                    <div className="border-t border-slate-100 pt-3 sm:border-0 sm:pt-1">
                      <DeleteProductButton id={p.id} />
                    </div>
                  </div>
                </AdminProductItem>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
