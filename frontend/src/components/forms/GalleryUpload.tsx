import { useState, useRef } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { supabase } from '../../lib/supabase'

interface GalleryUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  bucket: 'gallery'
  label: string
  helpText?: string
  maxImages?: number
  maxSizeMB?: number
  className?: string
}

export function GalleryUpload({
  value = [],
  onChange,
  bucket,
  label,
  helpText,
  maxImages = 10,
  maxSizeMB = 5,
  className = ''
}: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check max images
    if (value.length + files.length > maxImages) {
      setError(`Maximal ${maxImages} Bilder erlaubt`)
      return
    }

    setError(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Nicht angemeldet')
        setUploading(false)
        return
      }

      const uploadedUrls: string[] = []
      const totalFiles = files.length
      let completedFiles = 0

      for (const file of files) {
        // Validate file
        if (!file.type.startsWith('image/')) continue
        if (file.size > maxSizeMB * 1024 * 1024) continue

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/gallery_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName)
          uploadedUrls.push(urlData.publicUrl)
        }

        completedFiles++
        setUploadProgress(Math.round((completedFiles / totalFiles) * 100))
      }

      onChange([...value, ...uploadedUrls])
      setUploading(false)
      setUploadProgress(0)

      // Reset input
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Fehler beim Hochladen')
      setUploading(false)
    }
  }

  const handleRemove = (index: number) => {
    const newUrls = [...value]
    newUrls.splice(index, 1)
    onChange(newUrls)
  }

  const handleReorder = (newOrder: string[]) => {
    onChange(newOrder)
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-200 mb-2">
        {label}
        <span className="text-gray-500 font-normal ml-2">
          ({value.length}/{maxImages})
        </span>
      </label>

      {/* Image Grid with Reorder */}
      <Reorder.Group
        axis="x"
        values={value}
        onReorder={handleReorder}
        className="flex flex-wrap gap-3 mb-3"
      >
        <AnimatePresence>
          {value.map((url, index) => (
            <Reorder.Item
              key={url}
              value={url}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileDrag={{ scale: 1.05, zIndex: 10 }}
              className="relative w-24 h-24 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing group"
            >
              <img
                src={url}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Drag handle indicator */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1 h-1 rounded-full bg-white/70"></div>
                <div className="w-1 h-1 rounded-full bg-white/70"></div>
                <div className="w-1 h-1 rounded-full bg-white/70"></div>
              </div>
            </Reorder.Item>
          ))}
        </AnimatePresence>

        {/* Add Button */}
        {value.length < maxImages && (
          <motion.button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-600 hover:border-[#610AD1] transition-colors flex flex-col items-center justify-center text-gray-400 hover:text-[#610AD1]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {uploading ? (
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-1 relative">
                  <svg className="w-full h-full animate-spin" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="60 30"
                    />
                  </svg>
                </div>
                <span className="text-xs">{uploadProgress}%</span>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs">Hinzufügen</span>
              </>
            )}
          </motion.button>
        )}
      </Reorder.Group>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
