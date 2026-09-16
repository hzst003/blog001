/**
 * Node 导入脚本用：限制最长边 1280，输出 JPEG。
 * 优先使用 next 自带的 sharp；不可用时原样返回。
 */
import { createRequire } from 'node:module';

const MAX_EDGE = 1280;
const QUALITY = 82;

const require = createRequire(import.meta.url);

/**
 * @param {Buffer} bytes
 * @param {string} filename
 * @returns {Promise<{ bytes: Buffer, filename: string, mime: string }>}
 */
export async function compressImageBuffer(bytes, filename) {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    return {
      bytes,
      filename,
      mime: mimeFromName(filename),
    };
  }

  try {
    const image = sharp(bytes, { animated: false });
    const meta = await image.metadata();
    const w = meta.width || 0;
    const h = meta.height || 0;
    let pipeline = image.rotate();

    if (w && h && Math.max(w, h) > MAX_EDGE) {
      pipeline = pipeline.resize({
        width: w >= h ? MAX_EDGE : undefined,
        height: h > w ? MAX_EDGE : undefined,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const out = await pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
    const base = filename.replace(/\.[^.]+$/, '') || 'image';
    return {
      bytes: out,
      filename: `${base}.jpg`,
      mime: 'image/jpeg',
    };
  } catch {
    return {
      bytes,
      filename,
      mime: mimeFromName(filename),
    };
  }
}

function mimeFromName(filename) {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/png';
}
