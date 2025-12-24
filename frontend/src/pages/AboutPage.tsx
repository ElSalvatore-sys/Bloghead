import { useEffect } from 'react'
import { updatePageMeta, pageSEO } from '../lib/seo'

export function AboutPage() {
  useEffect(() => {
    updatePageMeta(pageSEO.about)
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <h1 className="font-display text-6xl md:text-8xl text-white">
        About
      </h1>
    </div>
  )
}
