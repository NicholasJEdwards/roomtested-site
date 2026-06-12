// Build-time social-card generator. Runs in plain Node BEFORE `astro build`
// (adapter v13 prerenders inside workerd, where satori's wasm and resvg's native
// module can't run — so cards are produced here and shipped as static assets).
//
// Output: public/cards/<collection>/<slug>/{og,pin,square}.png
// These are the base image assets for og: meta and every social platform workflow.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';

import matter from 'gray-matter';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const require = createRequire(import.meta.url);

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'src/content');
const OUT_DIR = path.join(ROOT, 'public/cards');

const SITE_NAME = 'RoomTested';
const AUTHOR = 'Nicholas Edwards';

const COLLECTIONS = { reviews: 'review', guides: 'guide', comparisons: 'comparison' };

const SIZES = {
  og: { width: 1200, height: 630 },
  pin: { width: 1000, height: 1500 },
  square: { width: 1080, height: 1080 },
};

function el(type, style, children) {
  return { type, props: { style, ...(children !== undefined ? { children } : {}) } };
}

function cardTree({ size, title, description, category, kind }) {
  const tall = size === 'pin';
  const titleSize = tall ? 72 : size === 'square' ? 64 : 60;
  const pad = tall ? 72 : 64;
  const kicker = `${category.replace(/-/g, ' ')} · ${kind}`.toUpperCase();

  return el(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: '#FAFAFA',
      color: '#09090B',
      padding: pad,
      fontFamily: 'Rubik',
      borderTop: '24px solid #09090B',
    },
    [
      el('div', { display: 'flex', flexDirection: 'column' }, [
        el('div', { fontSize: tall ? 30 : 26, letterSpacing: 4, color: '#DB2777', display: 'flex' }, kicker),
        el(
          'div',
          { fontSize: titleSize, fontWeight: 700, lineHeight: 1.12, marginTop: 28, display: 'flex' },
          title
        ),
        ...(description
          ? [
              el(
                'div',
                { fontSize: tall ? 34 : 30, lineHeight: 1.35, marginTop: 28, color: '#3F3F46', display: 'flex' },
                description
              ),
            ]
          : []),
      ]),
      el(
        'div',
        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: tall ? 30 : 26 },
        [
          el('div', { fontWeight: 700, color: '#09090B', display: 'flex' }, SITE_NAME),
          el('div', { color: '#3F3F46', display: 'flex' }, `Tested by ${AUTHOR} · roomtested.com`),
        ]
      ),
    ]
  );
}

async function main() {
  // Rubik statics from @fontsource/rubik — satori can't read woff2/variable
  // fonts, so the static .woff builds feed the card renderer (Test Bench brand).
  const [regular, bold] = await Promise.all([
    readFile(require.resolve('@fontsource/rubik/files/rubik-latin-400-normal.woff')),
    readFile(require.resolve('@fontsource/rubik/files/rubik-latin-700-normal.woff')),
  ]);
  const fonts = [
    { name: 'Rubik', data: regular, weight: 400, style: 'normal' },
    { name: 'Rubik', data: bold, weight: 700, style: 'normal' },
  ];

  let made = 0;
  for (const [collection, kind] of Object.entries(COLLECTIONS)) {
    const dir = path.join(CONTENT_DIR, collection);
    let files = [];
    try {
      files = (await readdir(dir)).filter((f) => /\.(md|mdx)$/.test(f));
    } catch {
      continue; // collection dir absent
    }

    for (const file of files) {
      const { data } = matter(await readFile(path.join(dir, file), 'utf8'));
      if (data.draft) continue;
      const slug = file.replace(/\.(md|mdx)$/, '');

      for (const [sizeName, { width, height }] of Object.entries(SIZES)) {
        const svg = await satori(
          cardTree({
            size: sizeName,
            title: String(data.title ?? slug),
            description: data.description ? String(data.description) : undefined,
            category: String(data.category ?? ''),
            kind,
          }),
          { width, height, fonts }
        );
        const png = new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
        const outDir = path.join(OUT_DIR, collection, slug);
        await mkdir(outDir, { recursive: true });
        await writeFile(path.join(outDir, `${sizeName}.png`), png);
        made += 1;
      }
    }
  }
  console.log(`[cards] generated ${made} card(s) into public/cards/`);
}

await main();
