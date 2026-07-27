#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const {
  IMG_ROOT,
  WIDTHS,
  listRasterImages,
  variantPath,
  webpPath
} = require('./lib/images');

async function optimizeImage(sourcePath) {
  const image = sharp(sourcePath);
  const metadata = await image.metadata();
  const metaPath = `${sourcePath}.meta.json`;
  fs.writeFileSync(
    metaPath,
    JSON.stringify({ width: metadata.width, height: metadata.height }, null, 2)
  );

  await sharp(sourcePath).webp({ quality: 80 }).toFile(webpPath(sourcePath));

  for (const width of WIDTHS) {
    if ((metadata.width || 0) <= width) {
      continue;
    }
    await sharp(sourcePath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(variantPath(sourcePath, width));
  }
}

async function main() {
  const files = listRasterImages(IMG_ROOT);
  let processed = 0;

  for (const file of files) {
    if (file.endsWith('.webp')) {
      continue;
    }
    await optimizeImage(file);
    processed += 1;
    console.log(`Optimized ${path.relative(IMG_ROOT, file)}`);
  }

  console.log(`Done. ${processed} images processed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
