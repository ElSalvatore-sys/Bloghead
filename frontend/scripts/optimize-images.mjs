/**
 * Image optimization script
 * Resizes images to max 1920px width and converts to WebP
 * Run with: node scripts/optimize-images.mjs
 */

import sharp from 'sharp'
import { readdir, mkdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = path.join(__dirname, '../public')
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images')
const OPTIMIZED_DIR = path.join(PUBLIC_DIR, 'images-optimized')

const MAX_WIDTH = 1920
const QUALITY = 80

async function optimizeImage(inputPath, outputPath) {
  const stats = await stat(inputPath)
  const originalSize = stats.size

  try {
    const image = sharp(inputPath)
    const metadata = await image.metadata()

    // Resize if wider than MAX_WIDTH
    const resizeOptions = metadata.width > MAX_WIDTH ? { width: MAX_WIDTH } : {}

    // Convert to WebP
    const webpPath = outputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp')

    await image
      .resize(resizeOptions)
      .webp({ quality: QUALITY })
      .toFile(webpPath)

    const newStats = await stat(webpPath)
    const newSize = newStats.size
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1)

    console.log(`✓ ${path.basename(inputPath)} → ${path.basename(webpPath)} (-${savings}%)`)
    console.log(`  ${(originalSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB`)

    return { original: originalSize, optimized: newSize }
  } catch (error) {
    console.error(`✗ Error optimizing ${path.basename(inputPath)}:`, error.message)
    return { original: originalSize, optimized: originalSize }
  }
}

async function main() {
  console.log('🖼️  Starting image optimization...\n')

  // Check if images directory exists
  if (!existsSync(IMAGES_DIR)) {
    console.log('No images directory found at:', IMAGES_DIR)
    return
  }

  // Create optimized directory
  if (!existsSync(OPTIMIZED_DIR)) {
    await mkdir(OPTIMIZED_DIR, { recursive: true })
  }

  const files = await readdir(IMAGES_DIR)
  const imageFiles = files.filter(f =>
    /\.(jpg|jpeg|png)$/i.test(f) && !f.includes('-optimized')
  )

  if (imageFiles.length === 0) {
    console.log('No images to optimize.')
    return
  }

  console.log(`Found ${imageFiles.length} images to optimize.\n`)

  let totalOriginal = 0
  let totalOptimized = 0

  for (const file of imageFiles) {
    const inputPath = path.join(IMAGES_DIR, file)
    const outputPath = path.join(OPTIMIZED_DIR, file)

    const result = await optimizeImage(inputPath, outputPath)
    totalOriginal += result.original
    totalOptimized += result.optimized
  }

  console.log('\n📊 Summary:')
  console.log(`   Original total: ${(totalOriginal / 1024 / 1024).toFixed(1)}MB`)
  console.log(`   Optimized total: ${(totalOptimized / 1024 / 1024).toFixed(1)}MB`)
  console.log(`   Savings: ${((totalOriginal - totalOptimized) / totalOriginal * 100).toFixed(1)}%`)
  console.log(`\n✨ Optimized images saved to: ${OPTIMIZED_DIR}`)
  console.log('\nTo use the optimized images:')
  console.log('1. Backup the original images folder')
  console.log('2. Replace public/images with the contents of public/images-optimized')
  console.log('3. Update image references in code to use .webp extension')
}

main().catch(console.error)
