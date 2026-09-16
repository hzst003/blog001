/** 浏览器端：上传前压缩，最长边约 1280，JPEG 质量 0.82 */

const MAX_EDGE = 1280;
const QUALITY = 0.82;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片读取失败'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('图片压缩失败'));
      },
      type,
      quality,
    );
  });
}

/**
 * 将图片压到最长边 ≤ 1280，输出 JPEG。
 * GIF 原样返回（避免丢动画）；压缩失败时回退原文件。
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  if (file.type === 'image/gif') return file;

  try {
    const img = await loadImage(file);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return file;

    const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
    const tw = Math.max(1, Math.round(w * scale));
    const th = Math.max(1, Math.round(h * scale));

    // 已够小且本身是 JPEG：跳过重编码
    if (scale === 1 && file.type === 'image/jpeg' && file.size < 400_000) {
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, tw, th);

    const blob = await canvasToBlob(canvas, 'image/jpeg', QUALITY);
    const base = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}
