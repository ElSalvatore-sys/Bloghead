import { useParams } from 'react-router-dom'

export function ArtistProfilePage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="font-display text-6xl md:text-8xl text-white">
        Artist Profile
      </h1>
      <p className="text-text-secondary text-lg">
        Artist ID: {id}
      </p>
    </div>
  )
}
