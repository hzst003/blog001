/**
 * 从 store0916/.env.local 加载环境变量（不覆盖已有 process.env）。
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storeRoot = path.resolve(__dirname, '..');
const envPath = path.join(storeRoot, '.env.local');

export function loadEnvLocal() {
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function isLocalPocketBaseUrl(url) {
  try {
    const host = new URL(url).hostname;
    return (
      host === '127.0.0.1' ||
      host === 'localhost' ||
      host === '::1' ||
      host.endsWith('.local')
    );
  } catch {
    return true;
  }
}
