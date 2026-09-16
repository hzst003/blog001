import type PocketBase from 'pocketbase';
import type { Product } from '@/lib/types';

/** 后台列表小图 */
const ADMIN_THUMB = '100x100';
/** 首页网格 */
const LIST_THUMB = '400x400';
/** 灯箱展示（按宽等比，不裁切） */
const VIEW_THUMB = '800x0';

/**
 * 把 PocketBase 文件地址改成站点同域路径。
 * EdgeOne 等 HTTPS 页面不能直接加载 http://IP:端口 的图（混合内容 / 端口拦截）。
 */
export function toPublicImageUrl(url: string | undefined) {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.startsWith('/api/files/')) return url;
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

function fileUrl(
  pb: PocketBase,
  product: Product,
  thumb?: string,
) {
  if (!product.image) return undefined;
  const absolute = thumb
    ? pb.files.getURL(product, product.image, { thumb })
    : pb.files.getURL(product, product.image);
  return toPublicImageUrl(absolute);
}

/** 列表用缩略图（需 PocketBase image 字段配置 thumbs） */
export function productThumbUrl(pb: PocketBase, product: Product) {
  return fileUrl(pb, product, LIST_THUMB);
}

/** 后台管理列表小图 */
export function productAdminThumbUrl(pb: PocketBase, product: Product) {
  return fileUrl(pb, product, ADMIN_THUMB);
}

/** 灯箱 / 详情用中等图（非原图） */
export function productViewUrl(pb: PocketBase, product: Product) {
  return fileUrl(pb, product, VIEW_THUMB);
}

/** 原图 URL（仅备用，首屏/灯箱勿用） */
export function productImageUrl(pb: PocketBase, product: Product) {
  return fileUrl(pb, product);
}
