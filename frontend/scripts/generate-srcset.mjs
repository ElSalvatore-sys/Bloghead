import sharp from 'sharp';
import { readdirSync, mkdirSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';

const SIZES = [400, 800, 1200, 1600];
const INPUT_DIR = './public/images';
const OUTPUT_DIR = './public/images/responsive';

// Create output directory
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

const files = readdirSync(INPUT_DIR).filter(f =>
  /\.(webp|jpg|jpeg|png)$/i.test(f) && !f.includes('-responsive')
);

console.log(`Processing ${files.length} images for srcset...`);

for (const file of files) {
  const inputPath = join(INPUT_DIR, file);
  const name = basename(file, extname(file));

  // Skip if file is in responsive folder
  if (file.includes('responsive')) continue;

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    for (const width of SIZES) {
      // Skip if original is smaller than target
      if (metadata.width && metadata.width < width) continue;

      const outputPath = join(OUTPUT_DIR, `${name}-${width}w.webp`);

      await sharp(inputPath)
        .resize(width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: 80 })
        .toFile(outputPath);

      console.log(`✓ ${name}-${width}w.webp`);
    }
  } catch (err) {
    console.error(`✗ Error processing ${file}:`, err.message);
  }
}

console.log('\n✅ Responsive images generated!');
console.log(`Output: ${OUTPUT_DIR}`);
