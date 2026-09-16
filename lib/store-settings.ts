import { cache } from 'react';
import { getPocketBase } from '@/lib/pocketbase';

export type StoreSettings = {
  id?: string;
  shop_name: string;
  phone: string;
  address: string;
  hours: string;
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  shop_name: '最简酒水店',
  phone: '138-0000-0000',
  address: '示例市示例路 88 号',
  hours: '10:00 – 22:00',
};

export function phoneToTel(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits ? `tel:${digits}` : undefined;
}

/** 同一请求内 metadata 与页面共享一次查询 */
export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  try {
    const pb = await getPocketBase();
    const list = await pb.collection('store_settings').getList<StoreSettings>(1, 1, {
      sort: 'created',
    });
    const row = list.items[0];
    if (!row) return { ...DEFAULT_STORE_SETTINGS };
    return {
      id: row.id,
      shop_name: row.shop_name?.trim() || DEFAULT_STORE_SETTINGS.shop_name,
      phone: row.phone?.trim() || DEFAULT_STORE_SETTINGS.phone,
      address: row.address?.trim() || DEFAULT_STORE_SETTINGS.address,
      hours: row.hours?.trim() || DEFAULT_STORE_SETTINGS.hours,
    };
  } catch (err) {
    console.error('[getStoreSettings]', err);
    return { ...DEFAULT_STORE_SETTINGS };
  }
});
