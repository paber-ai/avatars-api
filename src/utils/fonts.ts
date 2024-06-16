import { createRequire } from 'module';
import path from 'path';
import woff2Rs from '@woff2/woff2-rs';
import { promises as fs, existsSync } from 'fs';
import { getCacheDir } from './cache.js';
import { Font } from '../types.js';
import { isCharacterInUnicodeRange } from './unicode.js';

const require = createRequire(import.meta.url);

const FONT_NAMESPACE = '@fontsource';
const FONT_PACKAGES = [
  'noto-sans',
  'noto-sans-thai',
  'noto-sans-jp',
  'noto-sans-kr',
  'noto-sans-sc',
];

export function getRequiredFonts(svg: string, fonts: Font[]): string[] {
  const textNodes = svg.matchAll(/<text.*?>(.*?)<\/text>/gs);
  const requiredFonts = new Set<string>();

  if (!textNodes) {
    return [...requiredFonts];
  }

  for (const textNode of textNodes) {
    const text = textNode[1];

    char: for (const char of text) {
      for (const font of fonts) {
        for (const range of font.ranges) {
          if (isCharacterInUnicodeRange(char, range)) {
            requiredFonts.add(font.font);
            continue char;
          }
        }
      }
    }
  }

  return [...requiredFonts];
}

export async function loadAllFonts(): Promise<Font[]> {
  const packages = await Promise.all(FONT_PACKAGES.map(loadFontPackage));

  return packages.flat();
}

export async function loadFontPackage(fontPackage: string): Promise<Font[]> {
  const unicodeMetadata: Record<string, string> = (
    await import(`${FONT_NAMESPACE}/${fontPackage}/unicode.json`, {
      with: { type: 'json' },
    })
  ).default;

  return await Promise.all(
    Object.entries(unicodeMetadata).map(async ([subset, ranges]) =>
      loadFont(fontPackage, subset.replace(/[\[\]]/g, ''), ranges)
    )
  );
}

export async function loadFont(
  fontPackage: string,
  subset: string,
  ranges: string
): Promise<Font> {
  const parsedRanges = ranges.split(',').map(parseUnicodeRange);
  const fontPath = await parseFont(
    require.resolve(
      `${FONT_NAMESPACE}/${fontPackage}/files/${fontPackage}-${subset}-400-normal.woff2`
    )
  );

  return {
    font: fontPath,
    ranges: parsedRanges,
  };
}

export async function parseFont(fontPath: string): Promise<string> {
  const cacheDir = getCacheDir();

  const fontCachePath = path.join(
    cacheDir,
    path.basename(fontPath, '.woff2') + '.ttf'
  );

  if (existsSync(fontCachePath)) {
    return fontCachePath;
  }

  const font = await fs.readFile(require.resolve(fontPath));
  const outputBuffer = woff2Rs.decode(font);

  await fs.writeFile(fontCachePath, outputBuffer);

  return fontCachePath;
}

export function parseUnicodeRange(range: string): [number, number] {
  if (range.includes('-')) {
    const [start, end] = range.split('-');

    const parsedStart = parseInt(start.replace('U+', ''), 16);
    const parsedEnd = parseInt(end.replace('U+', ''), 16);

    return [parsedStart, parsedEnd];
  }

  const parsedStart = parseInt(range.replace('U+', ''), 16);
  const parsedEnd = parsedStart;

  return [parsedStart, parsedEnd];
}
