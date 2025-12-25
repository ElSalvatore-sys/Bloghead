/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Image optimization
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        lossless: false,
        quality: 80,
      },
      avif: {
        lossless: false,
        quality: 70,
      },
    }),
    // Bundle analyzer (generates bundle-stats.html)
    visualizer({
      filename: 'bundle-stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  // Path aliases for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@services': path.resolve(__dirname, './src/services'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
    },
  },

  // Drop console and debugger statements in production
  esbuild: {
    drop: ['console', 'debugger'],
  },

  // Build optimizations
  build: {
    // Target modern browsers for smaller bundle
    target: 'es2020',

    // Use esbuild for fast minification
    minify: 'esbuild',

    // Manual chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router')) {
            return 'vendor-react'
          }
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase'
          }
          // Framer Motion (heavy animation library)
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-framer'
          }
          // Recharts (heavy charting library)
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-')) {
            return 'vendor-recharts'
          }
          // Stripe
          if (id.includes('node_modules/@stripe')) {
            return 'vendor-stripe'
          }
          // Maps (Leaflet)
          if (id.includes('node_modules/leaflet') ||
              id.includes('node_modules/react-leaflet')) {
            return 'vendor-maps'
          }
          // Date utilities
          if (id.includes('node_modules/date-fns') ||
              id.includes('node_modules/react-day-picker')) {
            return 'vendor-dates'
          }
          // Form handling
          if (id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/@hookform') ||
              id.includes('node_modules/zod')) {
            return 'vendor-forms'
          }
          // Security
          if (id.includes('node_modules/dompurify')) {
            return 'vendor-security'
          }
          // Lucide icons
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons'
          }
          // Sentry (loaded async, separate chunk)
          if (id.includes('node_modules/@sentry')) {
            return 'vendor-sentry'
          }
        },

        // Asset file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // Chunk size warning
    chunkSizeWarningLimit: 500,

    // Generate source maps for debugging
    sourcemap: false,

    // CSS code splitting
    cssCodeSplit: true,

    // Reduce bundle size
    reportCompressedSize: true,

    // Inline assets smaller than 4kb
    assetsInlineLimit: 4096,
  },

  // Development server
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },

  // Preview server (for testing production builds locally)
  preview: {
    port: 4173,
  },

  // Optimize deps
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },

  // Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
})
