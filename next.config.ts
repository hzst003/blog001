import type { NextConfig } from 'next';

function pocketbaseRemotePatterns() {
  const hosts = new Set<string>(['127.0.0.1', 'localhost']);
  let port = '8090';
  let protocol: 'http' | 'https' = 'http';

  try {
    const raw = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
    const url = new URL(raw);
    protocol = url.protocol.replace(':', '') as 'http' | 'https';
    hosts.add(url.hostname);
    if (url.port) port = url.port;
  } catch {
    /* keep defaults */
  }

  return [...hosts].map((hostname) => ({
    protocol,
    hostname,
    ...(port ? { port } : {}),
    pathname: '/api/files/**' as const,
  }));
}

const pbHost = (() => {
  try {
    return new URL(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090').hostname;
  } catch {
    return '127.0.0.1';
  }
})();

const isLocalPb =
  pbHost === '127.0.0.1' ||
  pbHost === 'localhost' ||
  pbHost === '::1' ||
  pbHost.endsWith('.local');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
      {
        source: '/api/products',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
    ];
  },
  images: {
    // 商品图走同域 /api/files 代理，不再依赖浏览器直连 PocketBase
    unoptimized: true,
    // Next 16 默认拦截私网 IP；本地 PocketBase 需要放开
    dangerouslyAllowLocalIP: isLocalPb,
    remotePatterns: pocketbaseRemotePatterns(),
  },
};

export default nextConfig;
