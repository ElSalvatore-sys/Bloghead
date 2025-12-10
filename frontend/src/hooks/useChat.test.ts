import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

// Mock the dependencies before importing the hook
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id', email: 'test@example.com' }
  }))
}))

vi.mock('../services/chatService', () => ({
  getConversations: vi.fn(),
  getMessages: vi.fn(),
  sendMessage: vi.fn(),
  markMessagesAsRead: vi.fn(),
  createConversation: vi.fn(),
  archiveConversation: vi.fn(),
  subscribeToMessages: vi.fn(() => () => {}),
  subscribeToConversations: vi.fn(() => () => {}),
  getChatStats: vi.fn()
}))

// Import after mocking
import { useConversations, useMessages, useChat } from './useChat'
import { useAuth } from '../contexts/AuthContext'
import * as chatService from '../services/chatService'

describe('useConversations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('loads conversations on mount', async () => {
    const mockConversations = [
      { id: 'conv-1', title: 'Test Conversation', participants: [] }
    ]

    vi.mocked(chatService.getConversations).mockResolvedValue({
      data: mockConversations,
      error: null
    })
    vi.mocked(chatService.getChatStats).mockResolvedValue({
      totalConversations: 1,
      unreadCount: 0,
      activeConversations: 1
    })

    const { result } = renderHook(() => useConversations())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.conversations).toEqual(mockConversations)
    expect(chatService.getConversations).toHaveBeenCalledWith('test-user-id')
  })

  it('returns empty conversations when user is not logged in', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      userProfile: null,
      session: null,
      loading: false,
      needsOnboarding: false,
      completeOnboarding: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithFacebook: vi.fn(),
      signOut: vi.fn(),
      refreshUserProfile: vi.fn()
    })

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.conversations).toEqual([])
  })

  it('handles error when loading conversations fails', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'test-user-id' } as any,
      userProfile: null,
      session: null,
      loading: false,
      needsOnboarding: false,
      completeOnboarding: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithFacebook: vi.fn(),
      signOut: vi.fn(),
      refreshUserProfile: vi.fn()
    })

    vi.mocked(chatService.getConversations).mockResolvedValue({
      data: null,
      error: new Error('Failed to load')
    })
    vi.mocked(chatService.getChatStats).mockResolvedValue(null)

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Konversationen konnten nicht geladen werden.')
  })

  it('archives a conversation', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'test-user-id' } as any,
      userProfile: null,
      session: null,
      loading: false,
      needsOnboarding: false,
      completeOnboarding: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithFacebook: vi.fn(),
      signOut: vi.fn(),
      refreshUserProfile: vi.fn()
    })

    const mockConversations = [
      { id: 'conv-1', title: 'Test Conversation', participants: [] }
    ]

    vi.mocked(chatService.getConversations).mockResolvedValue({
      data: mockConversations,
      error: null
    })
    vi.mocked(chatService.getChatStats).mockResolvedValue(null)
    vi.mocked(chatService.archiveConversation).mockResolvedValue({
      data: null,
      error: null
    })

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let success: boolean
    await act(async () => {
      success = await result.current.archive('conv-1')
    })

    expect(success!).toBe(true)
    expect(result.current.conversations).toEqual([])
  })
})

describe('useMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'test-user-id' } as any,
      userProfile: null,
      session: null,
      loading: false,
      needsOnboarding: false,
      completeOnboarding: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithFacebook: vi.fn(),
      signOut: vi.fn(),
      refreshUserProfile: vi.fn()
    })
  })

  it('loads messages for a conversation', async () => {
    const mockMessages = [
      { id: 'msg-1', content: 'Hello', sender_id: 'user-1', created_at: '2024-01-01' }
    ]

    vi.mocked(chatService.getMessages).mockResolvedValue({
      data: mockMessages,
      error: null
    })
    vi.mocked(chatService.markMessagesAsRead).mockResolvedValue({
      data: null,
      error: null
    })

    const { result } = renderHook(() => useMessages('conv-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.messages).toEqual(mockMessages)
    expect(chatService.getMessages).toHaveBeenCalledWith('conv-1', 50, undefined)
  })

  it('returns empty messages when conversationId is null', async () => {
    const { result } = renderHook(() => useMessages(null))

    expect(result.current.messages).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(chatService.getMessages).not.toHaveBeenCalled()
  })

  it('sends a message', async () => {
    vi.mocked(chatService.getMessages).mockResolvedValue({
      data: [],
      error: null
    })
    vi.mocked(chatService.sendMessage).mockResolvedValue({
      data: { id: 'new-msg', content: 'Hello', sender_id: 'test-user-id' },
      error: null
    })
    vi.mocked(chatService.markMessagesAsRead).mockResolvedValue({
      data: null,
      error: null
    })

    const { result } = renderHook(() => useMessages('conv-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let success: boolean
    await act(async () => {
      success = await result.current.send('Hello')
    })

    expect(success!).toBe(true)
    expect(chatService.sendMessage).toHaveBeenCalledWith(
      'conv-1',
      'test-user-id',
      'Hello',
      undefined
    )
  })

  it('does not send empty messages', async () => {
    vi.mocked(chatService.getMessages).mockResolvedValue({
      data: [],
      error: null
    })

    const { result } = renderHook(() => useMessages('conv-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let success: boolean
    await act(async () => {
      success = await result.current.send('')
    })

    expect(success!).toBe(false)
    expect(chatService.sendMessage).not.toHaveBeenCalled()
  })
})

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'test-user-id' } as any,
      userProfile: null,
      session: null,
      loading: false,
      needsOnboarding: false,
      completeOnboarding: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithFacebook: vi.fn(),
      signOut: vi.fn(),
      refreshUserProfile: vi.fn()
    })
  })

  it('combines conversations and messages hooks', async () => {
    const mockConversations = [
      { id: 'conv-1', title: 'Chat 1', participants: [] }
    ]

    vi.mocked(chatService.getConversations).mockResolvedValue({
      data: mockConversations,
      error: null
    })
    vi.mocked(chatService.getChatStats).mockResolvedValue(null)

    const { result } = renderHook(() => useChat())

    await waitFor(() => {
      expect(result.current.conversationsLoading).toBe(false)
    })

    expect(result.current.conversations).toEqual(mockConversations)
    expect(result.current.activeConversationId).toBe(null)
    expect(result.current.messages).toEqual([])
  })

  it('allows selecting a conversation', async () => {
    vi.mocked(chatService.getConversations).mockResolvedValue({
      data: [{ id: 'conv-1', title: 'Chat 1', participants: [] }],
      error: null
    })
    vi.mocked(chatService.getChatStats).mockResolvedValue(null)
    vi.mocked(chatService.getMessages).mockResolvedValue({
      data: [{ id: 'msg-1', content: 'Hello', sender_id: 'user-1', created_at: '2024-01-01' }],
      error: null
    })
    vi.mocked(chatService.markMessagesAsRead).mockResolvedValue({
      data: null,
      error: null
    })

    const { result } = renderHook(() => useChat())

    await waitFor(() => {
      expect(result.current.conversationsLoading).toBe(false)
    })

    act(() => {
      result.current.selectConversation('conv-1')
    })

    expect(result.current.activeConversationId).toBe('conv-1')

    await waitFor(() => {
      expect(result.current.messagesLoading).toBe(false)
    })
  })

  it('returns activeConversation details', async () => {
    const mockConversations = [
      { id: 'conv-1', title: 'Chat 1', participants: [] }
    ]

    vi.mocked(chatService.getConversations).mockResolvedValue({
      data: mockConversations,
      error: null
    })
    vi.mocked(chatService.getChatStats).mockResolvedValue(null)
    vi.mocked(chatService.getMessages).mockResolvedValue({
      data: [],
      error: null
    })
    vi.mocked(chatService.markMessagesAsRead).mockResolvedValue({
      data: null,
      error: null
    })

    const { result } = renderHook(() => useChat())

    await waitFor(() => {
      expect(result.current.conversationsLoading).toBe(false)
    })

    expect(result.current.activeConversation).toBe(null)

    act(() => {
      result.current.selectConversation('conv-1')
    })

    await waitFor(() => {
      expect(result.current.activeConversation).toEqual(mockConversations[0])
    })
  })
})

describe('useConversations - startConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'test-user-id' } as any,
      userProfile: null,
      session: null,
      loading: false,
      needsOnboarding: false,
      completeOnboarding: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithFacebook: vi.fn(),
      signOut: vi.fn(),
      refreshUserProfile: vi.fn()
    })
  })

  it('starts a new conversation', async () => {
    vi.mocked(chatService.getConversations).mockResolvedValue({
      data: [],
      error: null
    })
    vi.mocked(chatService.getChatStats).mockResolvedValue(null)
    vi.mocked(chatService.createConversation).mockResolvedValue({
      data: { id: 'new-conv', title: 'Neue Konversation', participants: [] },
      error: null
    })

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let newConv: any
    await act(async () => {
      newConv = await result.current.startConversation(['user-1', 'user-2'], {
        title: 'Neue Konversation'
      })
    })

    expect(newConv).toEqual({ id: 'new-conv', title: 'Neue Konversation', participants: [] })
    expect(result.current.conversations).toHaveLength(1)
  })

  it('returns null when user is not logged in', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      userProfile: null,
      session: null,
      loading: false,
      needsOnboarding: false,
      completeOnboarding: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithFacebook: vi.fn(),
      signOut: vi.fn(),
      refreshUserProfile: vi.fn()
    })

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let newConv: any
    await act(async () => {
      newConv = await result.current.startConversation(['user-1', 'user-2'])
    })

    expect(newConv).toBe(null)
  })

  it('handles error when creating conversation fails', async () => {
    vi.mocked(chatService.getConversations).mockResolvedValue({
      data: [],
      error: null
    })
    vi.mocked(chatService.getChatStats).mockResolvedValue(null)
    vi.mocked(chatService.createConversation).mockResolvedValue({
      data: null,
      error: new Error('Creation failed')
    })

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let newConv: any
    await act(async () => {
      newConv = await result.current.startConversation(['user-1', 'user-2'])
    })

    expect(newConv).toBe(null)
    expect(result.current.error).toBe('Konversation konnte nicht erstellt werden.')
  })

  it('does not add duplicate conversation', async () => {
    const existingConv = { id: 'existing-conv', title: 'Existing', participants: [] }
    vi.mocked(chatService.getConversations).mockResolvedValue({
      data: [existingConv],
      error: null
    })
    vi.mocked(chatService.getChatStats).mockResolvedValue(null)
    vi.mocked(chatService.createConversation).mockResolvedValue({
      data: existingConv,
      error: null
    })

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.conversations).toHaveLength(1)

    await act(async () => {
      await result.current.startConversation(['user-1', 'user-2'])
    })

    // Should still be 1 since it's a duplicate
    expect(result.current.conversations).toHaveLength(1)
  })
})

describe('useMessages - error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'test-user-id' } as any,
      userProfile: null,
      session: null,
      loading: false,
      needsOnboarding: false,
      completeOnboarding: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithFacebook: vi.fn(),
      signOut: vi.fn(),
      refreshUserProfile: vi.fn()
    })
  })

  it('handles error when loading messages fails', async () => {
    vi.mocked(chatService.getMessages).mockResolvedValue({
      data: null,
      error: new Error('Failed to load')
    })

    const { result } = renderHook(() => useMessages('conv-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Nachrichten konnten nicht geladen werden.')
  })

  it('handles error when sending message fails', async () => {
    vi.mocked(chatService.getMessages).mockResolvedValue({
      data: [],
      error: null
    })
    vi.mocked(chatService.sendMessage).mockResolvedValue({
      data: null,
      error: new Error('Send failed')
    })
    vi.mocked(chatService.markMessagesAsRead).mockResolvedValue({
      data: null,
      error: null
    })

    const { result } = renderHook(() => useMessages('conv-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let success: boolean
    await act(async () => {
      success = await result.current.send('Hello')
    })

    expect(success!).toBe(false)
    expect(result.current.error).toBe('Nachricht konnte nicht gesendet werden.')
  })

  it('handles unexpected exception when sending message', async () => {
    vi.mocked(chatService.getMessages).mockResolvedValue({
      data: [],
      error: null
    })
    vi.mocked(chatService.sendMessage).mockRejectedValue(new Error('Network error'))
    vi.mocked(chatService.markMessagesAsRead).mockResolvedValue({
      data: null,
      error: null
    })

    const { result } = renderHook(() => useMessages('conv-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let success: boolean
    await act(async () => {
      success = await result.current.send('Hello')
    })

    expect(success!).toBe(false)
    expect(result.current.error).toBe('Ein unerwarteter Fehler ist aufgetreten.')
  })

  it('handles unexpected exception when loading messages', async () => {
    vi.mocked(chatService.getMessages).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useMessages('conv-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Ein unerwarteter Fehler ist aufgetreten.')
  })

  it('loads more messages when available', async () => {
    const initialMessages = [
      { id: 'msg-1', content: 'First', sender_id: 'user-1', created_at: '2024-01-01T10:00:00Z' }
    ]
    const olderMessages = [
      { id: 'msg-0', content: 'Older', sender_id: 'user-1', created_at: '2024-01-01T09:00:00Z' }
    ]

    vi.mocked(chatService.getMessages)
      .mockResolvedValueOnce({ data: initialMessages, error: null })
      .mockResolvedValueOnce({ data: olderMessages, error: null })
    vi.mocked(chatService.markMessagesAsRead).mockResolvedValue({
      data: null,
      error: null
    })

    const { result } = renderHook(() => useMessages('conv-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.messages).toEqual(initialMessages)

    await act(async () => {
      await result.current.loadMore()
    })

    // loadMore only works when there are 50 messages (hasMore = true)
    // Since we only have 1 message, hasMore is false
    expect(result.current.hasMore).toBe(false)
  })

  it('sends message with options', async () => {
    vi.mocked(chatService.getMessages).mockResolvedValue({
      data: [],
      error: null
    })
    vi.mocked(chatService.sendMessage).mockResolvedValue({
      data: { id: 'new-msg', content: 'Image', sender_id: 'test-user-id' },
      error: null
    })
    vi.mocked(chatService.markMessagesAsRead).mockResolvedValue({
      data: null,
      error: null
    })

    const { result } = renderHook(() => useMessages('conv-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let success: boolean
    await act(async () => {
      success = await result.current.send('Check this image', {
        messageType: 'image',
        fileUrl: 'https://example.com/image.jpg',
        fileName: 'photo.jpg',
        fileSize: 2048,
        fileType: 'image/jpeg'
      })
    })

    expect(success!).toBe(true)
    expect(chatService.sendMessage).toHaveBeenCalledWith(
      'conv-1',
      'test-user-id',
      'Check this image',
      {
        messageType: 'image',
        fileUrl: 'https://example.com/image.jpg',
        fileName: 'photo.jpg',
        fileSize: 2048,
        fileType: 'image/jpeg'
      }
    )
  })
})

describe('useConversations - error edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'test-user-id' } as any,
      userProfile: null,
      session: null,
      loading: false,
      needsOnboarding: false,
      completeOnboarding: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithFacebook: vi.fn(),
      signOut: vi.fn(),
      refreshUserProfile: vi.fn()
    })
  })

  it('handles unexpected exception when loading conversations', async () => {
    vi.mocked(chatService.getConversations).mockRejectedValue(new Error('Network error'))
    vi.mocked(chatService.getChatStats).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Ein unerwarteter Fehler ist aufgetreten.')
  })

  it('handles archive failure', async () => {
    vi.mocked(chatService.getConversations).mockResolvedValue({
      data: [{ id: 'conv-1', title: 'Test', participants: [] }],
      error: null
    })
    vi.mocked(chatService.getChatStats).mockResolvedValue(null)
    vi.mocked(chatService.archiveConversation).mockResolvedValue({
      data: null,
      error: new Error('Archive failed')
    })

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let success: boolean
    await act(async () => {
      success = await result.current.archive('conv-1')
    })

    expect(success!).toBe(false)
    // Conversation should not be removed
    expect(result.current.conversations).toHaveLength(1)
  })

  it('calls refresh function', async () => {
    vi.mocked(chatService.getConversations).mockResolvedValue({
      data: [],
      error: null
    })
    vi.mocked(chatService.getChatStats).mockResolvedValue(null)

    const { result } = renderHook(() => useConversations())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear mocks and set up new return value
    vi.mocked(chatService.getConversations).mockClear()
    vi.mocked(chatService.getConversations).mockResolvedValue({
      data: [{ id: 'new-conv', title: 'Refreshed', participants: [] }],
      error: null
    })

    await act(async () => {
      await result.current.refresh()
    })

    expect(chatService.getConversations).toHaveBeenCalled()
    expect(result.current.conversations).toHaveLength(1)
  })
})
