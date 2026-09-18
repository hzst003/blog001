'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { compressImageDetailed, formatBytes } from '@/lib/compress-image-client';

type Props = {
  id?: string;
  name?: string;
  required?: boolean;
  label?: string;
};

function assignFile(input: HTMLInputElement, file: File) {
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
}

export function ImageUploadField({
  id,
  name = 'image',
  required = false,
  label = '图片',
}: Props) {
  const autoId = useId();
  const fieldId = id || autoId;
  const cameraRef = useRef<HTMLInputElement>(null);
  const albumRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  async function onPick(file: File | undefined) {
    setError(null);
    setInfo(null);
    if (!file) return;

    setBusy(true);
    try {
      const result = await compressImageDetailed(file);
      if (submitRef.current) assignFile(submitRef.current, result.file);

      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      const url = URL.createObjectURL(result.file);
      previewRef.current = url;
      setPreview(url);

      if (result.outputBytes < result.originalBytes) {
        setInfo(`已压成小图 ${formatBytes(result.outputBytes)}（原图 ${formatBytes(result.originalBytes)}）`);
      } else {
        setInfo(`图片 ${formatBytes(result.outputBytes)}`);
      }
    } catch {
      setError('图片处理失败，请换一张再试');
    } finally {
      setBusy(false);
      if (cameraRef.current) cameraRef.current.value = '';
      if (albumRef.current) albumRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <p className="ui-label" id={`${fieldId}-label`}>
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="ui-btn flex-1 sm:flex-none"
          disabled={busy}
          onClick={() => cameraRef.current?.click()}
        >
          拍照
        </button>
        <button
          type="button"
          className="ui-btn-ghost flex-1 sm:flex-none"
          disabled={busy}
          onClick={() => albumRef.current?.click()}
        >
          相册
        </button>
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      <input
        ref={albumRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      <input
        ref={submitRef}
        id={fieldId}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        aria-labelledby={`${fieldId}-label`}
        aria-required={required || undefined}
      />

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="已选图片预览"
          className="mt-1 h-28 w-28 rounded-xl border border-slate-200 object-cover"
        />
      ) : null}
      {busy ? <p className="text-sm text-slate-500">正在压缩小图…</p> : null}
      {info ? <p className="text-sm text-teal-800">{info}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <p className="text-xs text-slate-400">拍照或选图后自动压缩再保存，不存原图。</p>
    </div>
  );
}
