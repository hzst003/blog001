'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdminPocketBase } from '@/lib/pocketbase-admin';
import { PRODUCT_CATEGORIES } from '@/lib/categories';

function asFile(value: FormDataEntryValue | null): File | null {
  if (!value || typeof value === 'string') return null;
  const blob = value as Blob;
  if (!blob.size) return null;
  if (typeof File !== 'undefined' && value instanceof File) return value;
  const name =
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof (value as { name?: unknown }).name === 'string'
      ? (value as { name: string }).name
      : 'upload.bin';
  return new File([blob], name, { type: blob.type || 'application/octet-stream' });
}

function parseCategory(raw: string) {
  const category = raw.trim() || '酒水';
  return (PRODUCT_CATEGORIES as readonly string[]).includes(category)
    ? category
    : '其它';
}

export async function updateProductPrice(formData: FormData) {
  const id = String(formData.get('id') || '');
  const price = Number(formData.get('price'));
  if (!id || !Number.isFinite(price) || price < 0) {
    throw new Error('价格无效');
  }

  const pb = await getAdminPocketBase();
  await pb.collection('products').update(id, { price });
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function updateProductImage(formData: FormData) {
  const id = String(formData.get('id') || '');
  const image = asFile(formData.get('image'));
  if (!id || !image) {
    throw new Error('请选择图片');
  }

  const pb = await getAdminPocketBase();
  await pb.collection('products').update(id, { image });
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function updateProduct(formData: FormData) {
  const id = String(formData.get('id') || '');
  const title = String(formData.get('title') || '').trim();
  const price = Number(formData.get('price'));
  const description = String(formData.get('description') || '').trim();
  const category = parseCategory(String(formData.get('category') || ''));
  const active = formData.get('active') === 'on' || formData.get('active') === 'true';

  if (!id) throw new Error('缺少商品 id');
  if (!title) throw new Error('请填写商品名称');
  if (!Number.isFinite(price) || price < 0) throw new Error('价格无效');

  const pb = await getAdminPocketBase();
  await pb.collection('products').update(id, {
    title,
    price,
    description,
    category,
    active,
  });
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function toggleProductActive(formData: FormData) {
  const id = String(formData.get('id') || '');
  const active = formData.get('active') === 'true';
  if (!id) throw new Error('缺少商品 id');

  const pb = await getAdminPocketBase();
  await pb.collection('products').update(id, { active });
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function createProduct(formData: FormData) {
  const title = String(formData.get('title') || '').trim();
  const price = Number(formData.get('price'));
  const description = String(formData.get('description') || '').trim();
  const category = parseCategory(String(formData.get('category') || '酒水'));
  const image = asFile(formData.get('image'));

  if (!title) throw new Error('请填写商品名称');
  if (!Number.isFinite(price) || price < 0) throw new Error('价格无效');

  const pb = await getAdminPocketBase();
  const data: Record<string, unknown> = {
    title,
    price,
    description: description || `精选${title}，到店品尝`,
    category,
    stock: 50,
    active: true,
  };
  if (image) data.image = image;

  await pb.collection('products').create(data);
  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin?created=1');
}

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get('id') || '');
  if (!id) throw new Error('缺少商品 id');

  const pb = await getAdminPocketBase();
  await pb.collection('products').delete(id);
  revalidatePath('/');
  revalidatePath('/admin');
}
