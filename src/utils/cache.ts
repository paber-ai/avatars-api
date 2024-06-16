import { promises as fs, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export function getCacheDir() {
  return path.join(__dirname, '..', '..', '.cache');
}

export async function ensureCacheDir() {
  const cacheDir = getCacheDir();

  if (!existsSync(cacheDir)) {
    await fs.mkdir(cacheDir);
  }
}
