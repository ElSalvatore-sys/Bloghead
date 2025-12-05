import { useState, useEffect, useCallback } from 'react'
import {
  getArtists,
  getGenres,
  getCities,
  getRegions,
} from '../services/artistService'
import type { ArtistFilters, ArtistListItem } from '../services/artistService'

export interface UseArtistsReturn {
  artists: ArtistListItem[]
  loading: boolean
  error: string | null
  filters: ArtistFilters
  genres: string[]
  cities: string[]
  regions: string[]
  totalCount: number
  updateFilters: (newFilters: Partial<ArtistFilters>) => void
  clearFilters: () => void
  refetch: () => Promise<void>
  loadMore: () => void
  hasMore: boolean
}

export function useArtists(initialFilters: ArtistFilters = {}): UseArtistsReturn {
  const [artists, setArtists] = useState<ArtistListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ArtistFilters>({
    limit: 20,
    offset: 0,
    ...initialFilters,
  })
  const [genres, setGenres] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  // Fetch artists
  const fetchArtists = useCallback(async (append = false) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError, count } = await getArtists(filters)

      if (fetchError) {
        setError('Künstler konnten nicht geladen werden.')
        console.error('Fetch error:', fetchError)
      } else {
        if (append) {
          setArtists(prev => [...prev, ...(data || [])])
        } else {
          setArtists(data || [])
        }
        setTotalCount(count || 0)
        setHasMore((data?.length || 0) >= (filters.limit || 20))
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const [genreResult, cityResult, regionResult] = await Promise.all([
        getGenres(),
        getCities(),
        getRegions(),
      ])

      if (genreResult.data) setGenres(genreResult.data)
      if (cityResult.data) setCities(cityResult.data)
      if (regionResult.data) setRegions(regionResult.data)
    } catch (err) {
      console.error('Error fetching filter options:', err)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchArtists()
  }, [fetchArtists])

  // Fetch filter options once
  useEffect(() => {
    fetchFilterOptions()
  }, [fetchFilterOptions])

  const updateFilters = useCallback((newFilters: Partial<ArtistFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      offset: 0, // Reset offset when filters change
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      limit: 20,
      offset: 0,
    })
  }, [])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setFilters(prev => ({
        ...prev,
        offset: (prev.offset || 0) + (prev.limit || 20),
      }))
    }
  }, [loading, hasMore])

  const refetch = useCallback(async () => {
    setFilters(prev => ({ ...prev, offset: 0 }))
    await fetchArtists()
  }, [fetchArtists])

  return {
    artists,
    loading,
    error,
    filters,
    genres,
    cities,
    regions,
    totalCount,
    updateFilters,
    clearFilters,
    refetch,
    loadMore,
    hasMore,
  }
}
