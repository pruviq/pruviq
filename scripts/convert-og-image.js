#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const input = path.resolve(process.cwd(), 'public', 'og-image.png');
const outWebp = path.resolve(process.cwd(), 'public', 'og-image.webp');
const outAvif = path.resolve(process.cwd(), 'public', 'og-image.avif');

(async () => {
  let sharp;
  try {
    const mod = await import('sharp');
    sharp = mod.default || mod;
  } catch (e) {
    console.warn('Optional dependency "sharp" is not installed. Skipping image conversion.');
    process.exit(0);
  }

  try {
    if (!fs.existsSync(input)) {
      console.error('Input file not found:', input);
      process.exit(2);
    }
    console.log('Converting', input);
    await sharp(input).resize(1200, 630).webp({ quality: 80 }).toFile(outWebp);
    await sharp(input).resize(1200, 630).avif({ quality: 50 }).toFile(outAvif);
    console.log('Generated:', outWebp, outAvif);
  } catch (e) {
    console.error('Error converting images:', e);
    process.exit(1);
  }
})();
