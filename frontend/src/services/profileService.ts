import { supabase } from '../lib/supabase'

export type UserType = 'fan' | 'artist' | 'service_provider' | 'event_organizer' | 'veranstalter'

export type ProfileTable =
  | 'fan_profiles'
  | 'artist_profiles'
  | 'service_provider_profiles'
  | 'event_organizer_profiles'
  | 'veranstalter_profiles'

// Map user types to profile tables
const profileTableMap: Record<UserType, ProfileTable> = {
  fan: 'fan_profiles',
  artist: 'artist_profiles',
  service_provider: 'service_provider_profiles',
  event_organizer: 'event_organizer_profiles',
  veranstalter: 'veranstalter_profiles',
}

// Get the user's type from the users table
export async function getUserType(userId: string): Promise<UserType | null> {
  const { data, error } = await supabase
    .from('users')
    .select('user_type')
    .eq('id', userId)
    .single()

  if (error || !data) {
    console.error('Error fetching user type:', error)
    return null
  }

  return data.user_type as UserType
}

// Get the user's base data from users table
export async function getUserData(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user data:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// Update user base data in users table
export async function updateUserData(userId: string, userData: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...userData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user data:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// Get the user's profile from the appropriate profile table
export async function getProfile(userId: string, userType: UserType) {
  const tableName = profileTableMap[userType]

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching profile:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// Upsert (create or update) the user's profile
export async function upsertProfile(
  userId: string,
  userType: UserType,
  profileData: Record<string, unknown>
) {
  const tableName = profileTableMap[userType]

  const { data, error } = await supabase
    .from(tableName)
    .upsert({
      user_id: userId,
      ...profileData,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting profile:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// Upload a profile image to Supabase Storage
export async function uploadProfileImage(
  userId: string,
  file: File,
  type: 'avatar' | 'cover' | 'gallery'
): Promise<{ url: string | null; error: Error | null }> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`

  // Map type to correct bucket
  const bucketMap: Record<string, string> = {
    avatar: 'avatars',
    cover: 'covers',
    gallery: 'gallery',
  }
  const bucket = bucketMap[type]

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    console.error('Error uploading image:', uploadError)
    return { url: null, error: uploadError }
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return { url: urlData.publicUrl, error: null }
}

// Upload audio file to Supabase Storage
export async function uploadAudioFile(
  userId: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/audio_${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('audio')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    console.error('Error uploading audio:', uploadError)
    return { url: null, error: uploadError }
  }

  const { data: urlData } = supabase.storage
    .from('audio')
    .getPublicUrl(fileName)

  return { url: urlData.publicUrl, error: null }
}

// Delete a file from storage
export async function deleteStorageFile(
  bucket: 'avatars' | 'gallery' | 'audio',
  filePath: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath])

  if (error) {
    console.error('Error deleting file:', error)
    return { error }
  }

  return { error: null }
}

// Get combined user data and profile
export async function getFullProfile(userId: string) {
  // First get user type
  const userType = await getUserType(userId)
  if (!userType) {
    return { userData: null, profile: null, userType: null, error: new Error('User type not found') }
  }

  // Get user base data and profile in parallel
  const [userResult, profileResult] = await Promise.all([
    getUserData(userId),
    getProfile(userId, userType),
  ])

  return {
    userData: userResult.data,
    profile: profileResult.data,
    userType,
    error: userResult.error || profileResult.error,
  }
}

// Save full profile (both users table and profile table)
export async function saveFullProfile(
  userId: string,
  userType: UserType,
  userData: Record<string, unknown>,
  profileData: Record<string, unknown>
) {
  // Update both in parallel
  const [userResult, profileResult] = await Promise.all([
    updateUserData(userId, userData),
    upsertProfile(userId, userType, profileData),
  ])

  return {
    userData: userResult.data,
    profile: profileResult.data,
    error: userResult.error || profileResult.error,
  }
}
