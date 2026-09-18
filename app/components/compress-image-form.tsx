'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { compressImageForUpload } from '@/lib/compress-image-client';

type Props = {
  action: (formData: FormData) => Promise<void>;
  className?: string;
  children: ReactNode;
  requireImage?: boolean;
};

function toUploadFile(value: FormDataEntryValue): File | null {
  if (typeof value === 'string' || !value) return null;
  const blob = value as Blob;
  if (!blob.size) return null;
  if (value instanceof File) return value;
  return new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' });
}

function isNextRedirect(err: unknown) {
  return (
    typeof err === 'object' &&
    err !== null &&
    'digest' in err &&
    typeof (err as { digest?: unknown }).digest === 'string' &&
    String((err as { digest: string }).digest).startsWith('NEXT_REDIRECT')
  );
}

/** 提交前压缩 name="image"，再调用服务端 action（走原生 form action，保证文件能传到服务端） */
export function CompressImageForm({ action, className, children, requireImage }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(fd: FormData) {
    setError(null);
    setPending(true);
    try {
      const raw = fd.get('image');
      const file = raw != null ? toUploadFile(raw) : null;
      if (requireImage && !file) {
        setError('请先拍照或从相册选图');
        setPending(false);
        return;
      }
      if (file) {
        const compressed =
          file.name.endsWith('-sm.jpg') && file.size < 400_000
            ? file
            : await compressImageForUpload(file);
        fd.set('image', compressed);
      }
      await action(fd);
      router.refresh();
    } catch (err) {
      if (isNextRedirect(err)) throw err;
      setError(err instanceof Error ? err.message : '上传失败，请重试');
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleAction} className={className} aria-busy={pending}>
      {children}
      {pending ? <p className="text-sm text-slate-500 sm:col-span-2">正在保存小图…</p> : null}
      {error ? <p className="text-sm text-red-600 sm:col-span-2">{error}</p> : null}
    </form>
  );
}
