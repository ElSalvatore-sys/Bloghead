import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  getFullProfile,
  saveFullProfile,
  uploadProfileImage,
  uploadAudioFile,
} from '../services/profileService'
import type { UserType } from '../services/profileService'

export interface UseProfileReturn {
  userData: Record<string, unknown> | null
  profile: Record<string, unknown> | null
  userType: UserType | null
  loading: boolean
  saving: boolean
  error: string | null
  loadProfile: () => Promise<void>
  saveProfile: (userData: Record<string, unknown>, profileData: Record<string, unknown>) => Promise<boolean>
  uploadImage: (file: File, type: 'avatar' | 'cover' | 'gallery') => Promise<string | null>
  uploadAudio: (file: File) => Promise<string | null>
}

export function useProfile(): UseProfileReturn {
  const { user } = useAuth()
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null)
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [userType, setUserType] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await getFullProfile(user.id)

      if (result.error) {
        setError('Profil konnte nicht geladen werden.')
        console.error('Profile load error:', result.error)
      } else {
        setUserData(result.userData)
        setProfile(result.profile)
        setUserType(result.userType)
      }
    } catch (err) {
      console.error('Unexpected error loading profile:', err)
      setError('Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load profile when user changes
  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const saveProfile = useCallback(async (
    newUserData: Record<string, unknown>,
    newProfileData: Record<string, unknown>
  ): Promise<boolean> => {
    if (!user || !userType) {
      setError('Nicht angemeldet.')
      return false
    }

    setSaving(true)
    setError(null)

    try {
      const result = await saveFullProfile(user.id, userType, newUserData, newProfileData)

      if (result.error) {
        setError('Profil konnte nicht gespeichert werden.')
        console.error('Profile save error:', result.error)
        return false
      }

      // Update local state with saved data
      setUserData(result.userData)
      setProfile(result.profile)
      return true
    } catch (err) {
      console.error('Unexpected error saving profile:', err)
      setError('Ein unerwarteter Fehler ist aufgetreten.')
      return false
    } finally {
      setSaving(false)
    }
  }, [user, userType])

  const uploadImage = useCallback(async (
    file: File,
    type: 'avatar' | 'cover' | 'gallery'
  ): Promise<string | null> => {
    if (!user) {
      setError('Nicht angemeldet.')
      return null
    }

    try {
      const result = await uploadProfileImage(user.id, file, type)

      if (result.error) {
        setError('Bild konnte nicht hochgeladen werden.')
        console.error('Image upload error:', result.error)
        return null
      }

      return result.url
    } catch (err) {
      console.error('Unexpected error uploading image:', err)
      setError('Ein unerwarteter Fehler ist aufgetreten.')
      return null
    }
  }, [user])

  const uploadAudio = useCallback(async (file: File): Promise<string | null> => {
    if (!user) {
      setError('Nicht angemeldet.')
      return null
    }

    try {
      const result = await uploadAudioFile(user.id, file)

      if (result.error) {
        setError('Audio konnte nicht hochgeladen werden.')
        console.error('Audio upload error:', result.error)
        return null
      }

      return result.url
    } catch (err) {
      console.error('Unexpected error uploading audio:', err)
      setError('Ein unerwarteter Fehler ist aufgetreten.')
      return null
    }
  }, [user])

  return {
    userData,
    profile,
    userType,
    loading,
    saving,
    error,
    loadProfile,
    saveProfile,
    uploadImage,
    uploadAudio,
  }
}
