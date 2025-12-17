import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { fadeInUp } from '../../lib/animations'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  bucket: 'avatars' | 'covers' | 'gallery'
  label: string
  helpText?: string
  aspectRatio?: 'square' | 'cover' | 'wide'
  maxSizeMB?: number
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  bucket,
  label,
  helpText,
  aspectRatio = 'square',
  maxSizeMB = 5,
  className = ''
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const aspectClasses = {
    square: 'aspect-square',
    cover: 'aspect-[3/1]',
    wide: 'aspect-video'
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setError(null)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Bitte nur Bilddateien hochladen')
      return
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Maximale Dateigröße: ${maxSizeMB}MB`)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Nicht angemeldet')
        setUploading(false)
        return
      }

      // Create unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      // Simulate progress (Supabase doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      clearInterval(progressInterval)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError('Fehler beim Hochladen')
        setUploading(false)
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      setUploadProgress(100)
      onChange(urlData.publicUrl)

      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (err) {
      console.error('Upload exception:', err)
      setError('Fehler beim Hochladen')
      setUploading(false)
    }
  }

  const handleRemove = () => {
    onChange(null)
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-200 mb-2">
        {label}
      </label>

      <div
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden ${aspectClasses[aspectRatio]} ${
          isDragging
            ? 'border-[#610AD1] bg-[#610AD1]/10'
            : value
            ? 'border-transparent'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence mode="wait">
          {value ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm hover:bg-white/30 transition-colors"
                >
                  Ändern
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-4 py-2 bg-red-500/80 backdrop-blur-sm rounded-lg text-white text-sm hover:bg-red-500 transition-colors"
                >
                  Entfernen
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 relative">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#374151"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#610AD1"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${uploadProgress * 2.51} 251`}
                        transform="rotate(-90 50 50)"
                        className="transition-all duration-200"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm text-white">
                      {uploadProgress}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Wird hochgeladen...</p>
                </div>
              ) : (
                <>
                  <svg
                    className="w-12 h-12 text-gray-500 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-400 text-center px-4">
                    <span className="text-[#610AD1]">Klicken</span> oder Bild hierher ziehen
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG bis {maxSizeMB}MB
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {helpText && !error && (
        <p className="mt-2 text-xs text-gray-500">{helpText}</p>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
