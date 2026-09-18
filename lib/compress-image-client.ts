/** 浏览器端：拍照/相册选图后压成小图再上传。最长边 960，目标约 200KB 内。 */

const MAX_EDGE = 960;
const QUALITY = 0.78;
const MAX_BYTES = 1_800_000;

export type CompressResult = {
  file: File;
  originalBytes: number;
  outputBytes: number;
};

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

async function loadSource(file: File): Promise<{
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  close: () => void;
}> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return {
        width: bmp.width,
        height: bmp.height,
        draw: (ctx, w, h) => ctx.drawImage(bmp, 0, 0, w, h),
        close: () => bmp.close(),
      };
    } catch {
      /* 回退 Image，部分 HEIC/相册格式走这里 */
    }
  }

  const img = await loadImage(file);
  return {
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
    draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
    close: () => undefined,
  };
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

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * 将图片压到最长边 ≤ 960 的 JPEG 小图。
 * GIF 原样返回（避免丢动画）。
 */
export async function compressImageDetailed(file: File): Promise<CompressResult> {
  const originalBytes = file.size;
  if (!file.type.startsWith('image/') && file.type !== '') {
    return { file, originalBytes, outputBytes: file.size };
  }
  if (file.type === 'image/gif') {
    return { file, originalBytes, outputBytes: file.size };
  }

  try {
    const src = await loadSource(file);
    const w = src.width;
    const h = src.height;
    if (!w || !h) {
      src.close();
      return { file, originalBytes, outputBytes: file.size };
    }

    const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
    const tw = Math.max(1, Math.round(w * scale));
    const th = Math.max(1, Math.round(h * scale));

    if (scale === 1 && file.type === 'image/jpeg' && file.size < 220_000) {
      src.close();
      return { file, originalBytes, outputBytes: file.size };
    }

    const canvas = document.createElement('canvas');
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      src.close();
      return { file, originalBytes, outputBytes: file.size };
    }
    src.draw(ctx, tw, th);
    src.close();

    let quality = QUALITY;
    let blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    while (blob.size > MAX_BYTES && quality > 0.45) {
      quality = Math.round((quality - 0.1) * 10) / 10;
      blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    }

    const base = file.name.replace(/\.[^.]+$/, '') || 'photo';
    const out = new File([blob], `${base}-sm.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
    return { file: out, originalBytes, outputBytes: out.size };
  } catch {
    return { file, originalBytes, outputBytes: file.size };
  }
}

export async function compressImageForUpload(file: File): Promise<File> {
  const { file: out } = await compressImageDetailed(file);
  return out;
}
