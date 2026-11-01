import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
const srcLogo = path.join(publicDir, 'CLIPNNGDOTIN_LOGO.jpg');

async function processLogo() {
  const img = sharp(srcLogo);
  const meta = await img.metadata();
  console.log('Original logo dimensions:', meta.width, 'x', meta.height);

  // Get raw pixel data to find bounding box of non-black pixels
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      const brightness = (r + g + b) / 3;
      if (brightness > 25) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log('Bounding box:', { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1 });

  // Add small padding around trimmed wordmark
  const pad = 12;
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(width - cropX, (maxX - minX + 1) + pad * 2);
  const cropH = Math.min(height - cropY, (maxY - minY + 1) + pad * 2);

  // Save trimmed JPG
  await sharp(srcLogo)
    .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
    .jpeg({ quality: 95 })
    .toFile(path.join(publicDir, 'logo-trimmed.jpg'));

  // Create transparent PNG from trimmed region
  const rgbaBuf = Buffer.alloc(cropW * cropH * 4);
  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const srcIdx = ((cropY + y) * width + (cropX + x)) * channels;
      const r = data[srcIdx], g = data[srcIdx + 1], b = data[srcIdx + 2];
      const lum = Math.max(r, g, b);
      const alpha = lum < 20 ? 0 : Math.min(255, Math.round(((lum - 20) / (235 - 20)) * 255));
      const dstIdx = (y * cropW + x) * 4;
      rgbaBuf[dstIdx] = 255;
      rgbaBuf[dstIdx + 1] = 255;
      rgbaBuf[dstIdx + 2] = 255;
      rgbaBuf[dstIdx + 3] = alpha;
    }
  }

  await sharp(rgbaBuf, { raw: { width: cropW, height: cropH, channels: 4 } })
    .png()
    .toFile(path.join(publicDir, 'logo.png'));

  console.log('Saved logo.png and logo-trimmed.jpg');

  // Find the clapperboard + "in" on the right side of the wordmark for the square favicon
  // Only the clapperboard top reaches the top 15% of the bounding box height!
  let clapMinX = width, clapMaxX = 0;
  const top15Y = minY + Math.floor((maxY - minY) * 0.15);
  for (let y = minY; y <= top15Y; y++) {
    for (let x = minX; x <= maxX; x++) {
      const idx = (y * width + x) * channels;
      if (data[idx] > 40) {
        if (x < clapMinX) clapMinX = x;
        if (x > clapMaxX) clapMaxX = x;
      }
    }
  }
  console.log('Clapperboard X range:', { clapMinX, clapMaxX, minX, maxX });

  const iconLeft = Math.max(minX, clapMinX - 8);
  const iconRight = maxX;
  const iconTop = minY;
  // Also find the bottom of "in" (excluding the descender of 'g' or 'p')
  let inMaxY = minY;
  for (let y = minY; y <= maxY; y++) {
    for (let x = iconLeft; x <= iconRight; x++) {
      const idx = (y * width + x) * channels;
      if (data[idx] > 40 && y > inMaxY) inMaxY = y;
    }
  }
  const iconBottom = inMaxY;
  const iconW = iconRight - iconLeft + 1;
  const iconH = iconBottom - iconTop + 1;
  console.log('Icon crop:', { iconLeft, iconTop, iconW, iconH });

  const iconCropBuf = await sharp(srcLogo)
    .extract({ left: iconLeft, top: iconTop, width: iconW, height: iconH })
    .toBuffer();

  // Create a square canvas with black background and ~22% padding so it is super readable at 16-32px
  const squareSize = Math.round(Math.max(iconW, iconH) * 1.38);
  const squareIconBuf = await sharp({
    create: {
      width: squareSize,
      height: squareSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  })
    .composite([{ input: iconCropBuf, gravity: 'center' }])
    .png()
    .toBuffer();

  for (const [name, size] of [
    ['favicon-16x16.png', 16],
    ['favicon-32x32.png', 32],
    ['apple-touch-icon.png', 180],
    ['icon-192.png', 192],
    ['icon-512.png', 512]
  ]) {
    await sharp(squareIconBuf)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
      .png()
      .toFile(path.join(publicDir, name));
  }

  // Create valid ICO file containing 32x32 and 16x16 PNG buffers
  const png16 = await fs.promises.readFile(path.join(publicDir, 'favicon-16x16.png'));
  const png32 = await fs.promises.readFile(path.join(publicDir, 'favicon-32x32.png'));
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(2, 4);

  const dir1 = Buffer.alloc(16);
  dir1.writeUInt8(16, 0);
  dir1.writeUInt8(16, 1);
  dir1.writeUInt8(0, 2);
  dir1.writeUInt8(0, 3);
  dir1.writeUInt16LE(1, 4);
  dir1.writeUInt16LE(32, 6);
  dir1.writeUInt32LE(png16.length, 8);
  dir1.writeUInt32LE(6 + 32, 12);

  const dir2 = Buffer.alloc(16);
  dir2.writeUInt8(32, 0);
  dir2.writeUInt8(32, 1);
  dir2.writeUInt8(0, 2);
  dir2.writeUInt8(0, 3);
  dir2.writeUInt16LE(1, 4);
  dir2.writeUInt16LE(32, 6);
  dir2.writeUInt32LE(png32.length, 8);
  dir2.writeUInt32LE(6 + 32 + png16.length, 12);

  const icoBuf = Buffer.concat([icoHeader, dir1, dir2, png16, png32]);
  await fs.promises.writeFile(path.join(publicDir, 'favicon.ico'), icoBuf);

  // Generate Open Graph 1200x630 image (logo centered on black background)
  const resizedWordmark = await sharp(path.join(publicDir, 'logo.png'))
    .resize({ width: 700, fit: 'inside' })
    .toBuffer();

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: { r: 0, g: 0, b: 0 }
    }
  })
    .composite([{ input: resizedWordmark, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));

  console.log('Generated all favicons and og-image.png!');
}

processLogo();
