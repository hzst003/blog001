import { NextResponse } from 'next/server';
import { getActiveGalleryProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { products, loadError } = await getActiveGalleryProducts();
  return NextResponse.json(
    { products, loadError },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
      },
    },
  );
}
