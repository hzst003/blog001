import { NextRequest, NextResponse } from 'next/server';

const ID_SEGMENT = /^[\w.-]+$/;
const THUMB = /^\d+x\d+$/;

function isSafeFilename(name: string) {
  return Boolean(name) && name.length < 500 && !name.includes('..') && !name.includes('/') && !name.includes('\\');
}

function pocketbaseOrigin() {
  const raw = process.env.POCKETBASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

function upstreamUrl(path: string[], thumb: string | null) {
  const origin = pocketbaseOrigin();
  if (!origin) return null;
  if (path.length !== 3) return null;
  if (!ID_SEGMENT.test(path[0]) || !ID_SEGMENT.test(path[1]) || !isSafeFilename(path[2])) {
    return null;
  }

  const target = new URL(
    `/api/files/${path.map(encodeURIComponent).join('/')}`,
    origin,
  );
  if (thumb) {
    if (!THUMB.test(thumb)) return null;
    target.searchParams.set('thumb', thumb);
  }
  return target;
}

async function proxyFile(req: NextRequest, path: string[]) {
  const target = upstreamUrl(path, req.nextUrl.searchParams.get('thumb'));
  if (!target) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      headers: { Accept: 'image/*,*/*' },
      redirect: 'manual',
    });
  } catch {
    return new NextResponse('Bad Gateway', { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new NextResponse(null, { status: upstream.status === 404 ? 404 : 502 });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  headers.set('cache-control', 'public, max-age=2592000, s-maxage=2592000, immutable');

  return new NextResponse(upstream.body, { status: 200, headers });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxyFile(req, path);
}
