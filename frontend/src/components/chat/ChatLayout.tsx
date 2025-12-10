import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useChat } from '../../hooks/useChat'
import { ConversationList } from './ConversationList'
import { ChatWindow } from './ChatWindow'

interface ChatLayoutProps {
  initialConversationId?: string | null
}

export function ChatLayout({ initialConversationId = null }: ChatLayoutProps) {
  const { user } = useAuth()
  const {
    conversations,
    conversationsLoading,
    conversationsError,
    activeConversationId,
    activeConversation,
    selectConversation,
    messages,
    messagesLoading,
    messagesError,
    sendMessage,
    sending,
    hasMoreMessages,
    loadMoreMessages
  } = useChat()

  // Mobile sidebar state
  const [showSidebar, setShowSidebar] = useState(true)

  // Handle initial conversation selection
  useEffect(() => {
    if (initialConversationId && !activeConversationId) {
      selectConversation(initialConversationId)
      setShowSidebar(false)
    }
  }, [initialConversationId, activeConversationId, selectConversation])

  // On mobile, hide sidebar when conversation is selected
  const handleSelectConversation = (conversationId: string) => {
    selectConversation(conversationId)
    // Hide sidebar on mobile when selecting a conversation
    if (window.innerWidth < 768) {
      setShowSidebar(false)
    }
  }

  // On mobile, show sidebar when back is pressed
  const handleBack = () => {
    setShowSidebar(true)
    selectConversation(null)
  }

  // Handle send message
  const handleSendMessage = async (content: string): Promise<boolean> => {
    return await sendMessage(content)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full bg-[#171717]">
        <div className="text-center">
          <p className="text-gray-400">Bitte melde dich an, um Nachrichten zu sehen</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-[#171717] overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div
        className={`
          w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-white/10
          ${showSidebar ? 'block' : 'hidden md:block'}
        `}
      >
        <ConversationList
          conversations={conversations}
          currentUserId={user.id}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          loading={conversationsLoading}
          error={conversationsError}
        />
      </div>

      {/* Main Chat Window */}
      <div
        className={`
          flex-1 min-w-0
          ${!showSidebar ? 'block' : 'hidden md:block'}
        `}
      >
        <ChatWindow
          conversation={activeConversation}
          messages={messages}
          currentUserId={user.id}
          loading={messagesLoading}
          sending={sending}
          error={messagesError}
          hasMore={hasMoreMessages}
          onSendMessage={handleSendMessage}
          onLoadMore={loadMoreMessages}
          onBack={handleBack}
          showBackButton={!showSidebar}
        />
      </div>
    </div>
  )
}

export default ChatLayout
