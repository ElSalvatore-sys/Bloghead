import { useRef, useState, type ChangeEvent } from 'react'
import { CameraIcon } from '../icons'

interface ImageUploadProps {
  /** Type of image upload: cover for banner, avatar for profile pic */
  type: 'cover' | 'avatar'
  /** Current image URL */
  currentImage?: string
  /** Callback when image is selected */
  onImageSelect: (file: File, previewUrl: string) => void
  /** Optional class name */
  className?: string
}

export function ImageUpload({
  type,
  currentImage,
  onImageSelect,
  className = ''
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const displayImage = preview || currentImage

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string
      setPreview(previewUrl)
      onImageSelect(file, previewUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  if (type === 'cover') {
    return (
      <div
        className={`relative w-full h-48 md:h-64 lg:h-80 overflow-hidden group cursor-pointer ${className}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt="Cover"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover grayscale"
          />
        ) : (
          <div className="w-full h-full bg-bg-card" />
        )}

        {/* Overlay */}
        <div className={`
          absolute inset-0 bg-black/50 flex items-center justify-center
          transition-opacity duration-200
          ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}>
          <div className="flex flex-col items-center gap-2 text-white">
            <CameraIcon size={40} />
            <span className="text-sm font-medium uppercase tracking-wide">
              Titelbild ändern
            </span>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    )
  }

  // Avatar type
  return (
    <div
      className={`relative group cursor-pointer ${className}`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-bg-primary bg-bg-card">
        {displayImage ? (
          <img
            src={displayImage}
            alt="Avatar"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-bg-card flex items-center justify-center">
            <CameraIcon size={40} className="text-white/40" />
          </div>
        )}
      </div>

      {/* Camera overlay */}
      <div className={`
        absolute inset-0 rounded-full bg-black/50 flex items-center justify-center
        transition-opacity duration-200
        ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
      `}>
        <CameraIcon size={32} className="text-white" />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
