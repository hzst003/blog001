import { getPocketBase } from '@/lib/pocketbase';
import { productThumbUrl, productViewUrl } from '@/lib/product-images';
import type { GalleryProduct } from '@/app/components/product-gallery';
import type { Product } from '@/lib/types';

export async function getActiveGalleryProducts(): Promise<{
  products: GalleryProduct[];
  loadError: boolean;
}> {
  const pb = await getPocketBase();

  let records: Product[] = [];
  let loadError = false;
  try {
    records = await pb.collection('products').getFullList<Product>({
      filter: 'active = true',
      sort: '-created',
    });
  } catch (err) {
    console.error('[catalog] products', err);
    try {
      records = await pb.collection('products').getFullList<Product>({
        filter: 'active = true',
        sort: '-id',
      });
    } catch (err2) {
      console.error('[catalog] products fallback', err2);
      records = [];
      loadError = true;
    }
  }

  return {
    loadError,
    products: records.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      description: p.description,
      category: p.category,
      thumbUrl: productThumbUrl(pb, p),
      imageUrl: productViewUrl(pb, p),
    })),
  };
}
