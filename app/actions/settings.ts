'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdminPocketBase } from '@/lib/pocketbase-admin';
import { DEFAULT_STORE_SETTINGS } from '@/lib/store-settings';

export async function updateStoreSettings(formData: FormData) {
  const shop_name =
    String(formData.get('shop_name') || '').trim() || DEFAULT_STORE_SETTINGS.shop_name;
  const phone = String(formData.get('phone') || '').trim() || DEFAULT_STORE_SETTINGS.phone;
  const address =
    String(formData.get('address') || '').trim() || DEFAULT_STORE_SETTINGS.address;
  const hours = String(formData.get('hours') || '').trim() || DEFAULT_STORE_SETTINGS.hours;

  const pb = await getAdminPocketBase();
  const list = await pb.collection('store_settings').getList(1, 1, { sort: 'created' });
  const payload = { shop_name, phone, address, hours };

  if (list.items[0]) {
    await pb.collection('store_settings').update(list.items[0].id, payload);
  } else {
    await pb.collection('store_settings').create(payload);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin?settings=1');
}
