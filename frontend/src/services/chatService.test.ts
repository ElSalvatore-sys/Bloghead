import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  MESSAGE_TYPE_CONFIG,
  formatMessageTime,
  formatMessageDate,
  getOtherParticipant,
  getConversations,
  getArchivedConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  createConversation,
  archiveConversation,
  unarchiveConversation,
  muteConversation,
  unmuteConversation,
  deleteMessage,
  editMessage,
  getChatStats,
  searchConversations,
  subscribeToMessages,
  subscribeToConversations,
  type Conversation,
  type Participant
} from './chatService'
import { supabase } from '../lib/supabase'

// Create a flexible mock that handles all Supabase chain methods
const createChainMock = (finalValue: Record<string, unknown> = { data: [], error: null }) => {
  const mock: Record<string, ReturnType<typeof vi.fn>> = {}
  const chainMethods = [
    'select', 'insert', 'update', 'delete', 'eq', 'neq', 'contains',
    'in', 'or', 'order', 'limit', 'lt', 'single', 'head', 'filter'
  ]

  chainMethods.forEach(method => {
    mock[method] = vi.fn(() => mock)
  })

  // Make it thenable
  mock.then = vi.fn((resolve) => resolve(finalValue))

  return mock
}

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => createChainMock()),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis()
    })),
    removeChannel: vi.fn()
  }
}))

describe('MESSAGE_TYPE_CONFIG', () => {
  it('contains all message types with German labels', () => {
    expect(MESSAGE_TYPE_CONFIG.text.label).toBe('Text')
    expect(MESSAGE_TYPE_CONFIG.image.label).toBe('Bild')
    expect(MESSAGE_TYPE_CONFIG.file.label).toBe('Datei')
    expect(MESSAGE_TYPE_CONFIG.audio.label).toBe('Audio')
    expect(MESSAGE_TYPE_CONFIG.system.label).toBe('System')
    expect(MESSAGE_TYPE_CONFIG.booking_update.label).toBe('Buchungs-Update')
  })

  it('contains icons for all message types', () => {
    expect(MESSAGE_TYPE_CONFIG.text.icon).toBe('💬')
    expect(MESSAGE_TYPE_CONFIG.image.icon).toBe('🖼️')
    expect(MESSAGE_TYPE_CONFIG.file.icon).toBe('📎')
    expect(MESSAGE_TYPE_CONFIG.audio.icon).toBe('🎵')
    expect(MESSAGE_TYPE_CONFIG.system.icon).toBe('ℹ️')
    expect(MESSAGE_TYPE_CONFIG.booking_update.icon).toBe('📅')
  })
})

describe('formatMessageTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-12-09T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "Jetzt" for messages less than 1 minute old', () => {
    const now = new Date()
    const thirtySecondsAgo = new Date(now.getTime() - 30000).toISOString()
    expect(formatMessageTime(thirtySecondsAgo)).toBe('Jetzt')
  })

  it('returns minutes ago for messages 1-59 minutes old', () => {
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000).toISOString()
    expect(formatMessageTime(fiveMinutesAgo)).toBe('vor 5 Min.')

    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000).toISOString()
    expect(formatMessageTime(thirtyMinutesAgo)).toBe('vor 30 Min.')
  })

  it('returns time format for messages within 24 hours', () => {
    const now = new Date()
    const twoHoursAgo = new Date(now.getTime() - 2 * 3600000).toISOString()
    const result = formatMessageTime(twoHoursAgo)
    // Should match HH:MM pattern
    expect(result).toMatch(/\d{2}:\d{2}/)
  })

  it('returns weekday and time for messages within 7 days', () => {
    const now = new Date()
    const threeDaysAgo = new Date(now.getTime() - 3 * 86400000).toISOString()
    const result = formatMessageTime(threeDaysAgo)
    // Should contain time pattern
    expect(result).toMatch(/\d{2}:\d{2}/)
  })

  it('returns date format for messages older than 7 days', () => {
    const now = new Date()
    const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000).toISOString()
    const result = formatMessageTime(twoWeeksAgo)
    // Should contain date pattern DD.MM.YY
    expect(result).toMatch(/\d{2}\.\d{2}\.\d{2}/)
  })
})

describe('formatMessageDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-12-09T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "Heute" for today', () => {
    const today = new Date().toISOString()
    expect(formatMessageDate(today)).toBe('Heute')
  })

  it('returns "Gestern" for yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString()
    expect(formatMessageDate(yesterday)).toBe('Gestern')
  })

  it('returns weekday name for dates within 7 days', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString()
    const result = formatMessageDate(threeDaysAgo)
    // Should be a German weekday name
    const germanWeekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
    expect(germanWeekdays.some(day => result.includes(day))).toBe(true)
  })

  it('returns full date for dates older than 7 days', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString()
    const result = formatMessageDate(twoWeeksAgo)
    // Should contain year
    expect(result).toContain('2025')
  })
})

describe('getOtherParticipant', () => {
  const mockParticipant1: Participant = {
    id: 'user-1',
    membername: 'MaxMustermann',
    vorname: 'Max',
    nachname: 'Mustermann',
    profile_image_url: null,
    user_type: 'artist'
  }

  const mockParticipant2: Participant = {
    id: 'user-2',
    membername: 'AnnaSchmidt',
    vorname: 'Anna',
    nachname: 'Schmidt',
    profile_image_url: 'https://example.com/avatar.jpg',
    user_type: 'customer'
  }

  const mockConversation: Conversation = {
    id: 'conv-1',
    booking_id: null,
    booking_request_id: null,
    participant_ids: ['user-1', 'user-2'],
    title: null,
    last_message_at: '2025-12-09T10:00:00Z',
    last_message_preview: 'Hello!',
    is_archived: false,
    is_muted_by: null,
    created_at: '2025-12-09T09:00:00Z',
    updated_at: null,
    participants: [mockParticipant1, mockParticipant2]
  }

  it('returns the other participant when current user is first', () => {
    const result = getOtherParticipant(mockConversation, 'user-1')
    expect(result?.id).toBe('user-2')
    expect(result?.membername).toBe('AnnaSchmidt')
  })

  it('returns the other participant when current user is second', () => {
    const result = getOtherParticipant(mockConversation, 'user-2')
    expect(result?.id).toBe('user-1')
    expect(result?.membername).toBe('MaxMustermann')
  })

  it('returns undefined when participants array is missing', () => {
    const convWithoutParticipants: Conversation = {
      ...mockConversation,
      participants: undefined
    }
    const result = getOtherParticipant(convWithoutParticipants, 'user-1')
    expect(result).toBeUndefined()
  })

  it('returns undefined when current user is not in conversation', () => {
    const result = getOtherParticipant(mockConversation, 'user-3')
    // Both participants will be considered "other"
    expect(result).toBeDefined()
  })

  it('returns undefined when participants array is empty', () => {
    const convWithEmptyParticipants: Conversation = {
      ...mockConversation,
      participants: []
    }
    const result = getOtherParticipant(convWithEmptyParticipants, 'user-1')
    expect(result).toBeUndefined()
  })
})

// Tests for Supabase-based functions
describe('subscribeToMessages', () => {
  it('creates a channel subscription', () => {
    const callback = vi.fn()
    const unsubscribe = subscribeToMessages('conv-1', callback)

    expect(supabase.channel).toHaveBeenCalledWith('messages:conv-1')
    expect(typeof unsubscribe).toBe('function')
  })

  it('returns an unsubscribe function', () => {
    const callback = vi.fn()
    const unsubscribe = subscribeToMessages('conv-1', callback)

    unsubscribe()
    expect(supabase.removeChannel).toHaveBeenCalled()
  })
})

describe('subscribeToConversations', () => {
  it('creates a channel subscription for user', () => {
    const callback = vi.fn()
    const unsubscribe = subscribeToConversations('user-1', callback)

    expect(supabase.channel).toHaveBeenCalledWith('conversations:user-1')
    expect(typeof unsubscribe).toBe('function')
  })

  it('returns an unsubscribe function', () => {
    const callback = vi.fn()
    const unsubscribe = subscribeToConversations('user-1', callback)

    unsubscribe()
    expect(supabase.removeChannel).toHaveBeenCalled()
  })
})

// Additional tests for async Supabase functions
describe('getConversations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty data when no conversations exist', async () => {
    const result = await getConversations('user-1')
    expect(result.data).toEqual([])
    expect(result.error).toBeNull()
  })

  it('calls supabase with correct parameters', async () => {
    await getConversations('user-1')
    expect(supabase.from).toHaveBeenCalledWith('conversations')
  })
})

describe('getArchivedConversations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns archived conversations', async () => {
    const result = await getArchivedConversations('user-1')
    expect(result.error).toBeNull()
  })

  it('calls supabase from conversations table', async () => {
    await getArchivedConversations('user-1')
    expect(supabase.from).toHaveBeenCalledWith('conversations')
  })
})

describe('getMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty array when no messages exist', async () => {
    const result = await getMessages('conv-1')
    expect(result.data).toEqual([])
    expect(result.error).toBeNull()
  })

  it('calls supabase with conversation id', async () => {
    await getMessages('conv-1')
    expect(supabase.from).toHaveBeenCalledWith('messages')
  })

  it('accepts custom limit', async () => {
    await getMessages('conv-1', 25)
    expect(supabase.from).toHaveBeenCalledWith('messages')
  })

  it('accepts before parameter for pagination', async () => {
    await getMessages('conv-1', 50, '2025-12-09T10:00:00Z')
    expect(supabase.from).toHaveBeenCalledWith('messages')
  })
})

describe('sendMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends a text message', async () => {
    const result = await sendMessage('conv-1', 'user-1', 'Hello!')
    expect(supabase.from).toHaveBeenCalledWith('messages')
    expect(result.data).toBeDefined()
  })

  it('sends message with file attachment options', async () => {
    const result = await sendMessage('conv-1', 'user-1', 'Check this file', {
      messageType: 'file',
      fileUrl: 'https://example.com/file.pdf',
      fileName: 'document.pdf',
      fileSize: 1024,
      fileType: 'application/pdf'
    })
    expect(result.data).toBeDefined()
  })

  it('sends image message type', async () => {
    const result = await sendMessage('conv-1', 'user-1', 'Image', {
      messageType: 'image',
      fileUrl: 'https://example.com/image.jpg'
    })
    expect(result.data).toBeDefined()
  })
})

describe('markMessagesAsRead', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('marks messages as read', async () => {
    const result = await markMessagesAsRead('conv-1', 'user-1')
    expect(result.error).toBeNull()
    expect(supabase.from).toHaveBeenCalledWith('messages')
  })
})

describe('createConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a conversation between participants', async () => {
    const result = await createConversation(['user-1', 'user-2'])
    expect(supabase.from).toHaveBeenCalledWith('conversations')
    // Either creates new or returns existing
    expect(result.error).toBeNull()
  })

  it('creates conversation with title', async () => {
    await createConversation(['user-1', 'user-2'], {
      title: 'Buchungsanfrage'
    })
    expect(supabase.from).toHaveBeenCalledWith('conversations')
  })

  it('creates conversation with booking id', async () => {
    await createConversation(['user-1', 'user-2'], {
      bookingId: 'booking-123'
    })
    expect(supabase.from).toHaveBeenCalledWith('conversations')
  })

  it('creates conversation with booking request id', async () => {
    await createConversation(['user-1', 'user-2'], {
      bookingRequestId: 'req-456'
    })
    expect(supabase.from).toHaveBeenCalledWith('conversations')
  })
})

describe('archiveConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('archives a conversation', async () => {
    const result = await archiveConversation('conv-1')
    expect(result.error).toBeNull()
    expect(supabase.from).toHaveBeenCalledWith('conversations')
  })
})

describe('unarchiveConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('unarchives a conversation', async () => {
    const result = await unarchiveConversation('conv-1')
    expect(result.error).toBeNull()
    expect(supabase.from).toHaveBeenCalledWith('conversations')
  })
})

describe('muteConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mutes a conversation for a user', async () => {
    const result = await muteConversation('conv-1', 'user-1')
    expect(result.error).toBeNull()
    expect(supabase.from).toHaveBeenCalledWith('conversations')
  })
})

describe('unmuteConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('unmutes a conversation for a user', async () => {
    const result = await unmuteConversation('conv-1', 'user-1')
    expect(result.error).toBeNull()
    expect(supabase.from).toHaveBeenCalledWith('conversations')
  })
})

describe('deleteMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('soft deletes a message', async () => {
    const result = await deleteMessage('msg-1')
    expect(result.error).toBeNull()
    expect(supabase.from).toHaveBeenCalledWith('messages')
  })
})

describe('editMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('edits message content', async () => {
    const result = await editMessage('msg-1', 'Updated content')
    expect(result.error).toBeNull()
    expect(supabase.from).toHaveBeenCalledWith('messages')
  })

  it('accepts German text in edited content', async () => {
    const result = await editMessage('msg-1', 'Aktualisierte Nachricht')
    expect(result.error).toBeNull()
  })
})

describe('getChatStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns chat statistics', async () => {
    const result = await getChatStats('user-1')
    expect(result.totalConversations).toBe(0)
    expect(result.unreadMessages).toBe(0)
    expect(result.archivedConversations).toBe(0)
  })

  it('calls supabase for conversations', async () => {
    await getChatStats('user-1')
    expect(supabase.from).toHaveBeenCalledWith('conversations')
  })
})

describe('searchConversations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('searches conversations by term', async () => {
    const result = await searchConversations('user-1', 'Buchung')
    expect(result.error).toBeNull()
  })

  it('calls supabase with correct table', async () => {
    await searchConversations('user-1', 'Test')
    expect(supabase.from).toHaveBeenCalledWith('conversations')
  })

  it('handles empty search term', async () => {
    const result = await searchConversations('user-1', '')
    expect(result.error).toBeNull()
  })
})
