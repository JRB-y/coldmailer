import { ref } from 'vue'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  validationResults?: any[]
  timestamp: Date
}

export const useChat = () => {
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Add initial greeting message
  if (messages.value.length === 0) {
    messages.value.push({
      id: generateId(),
      role: 'assistant',
      content: 'Hello! I\'m your email validation assistant. I can help you:\n\n• Validate single emails\n• Check multiple emails at once\n• Upload CSV files for bulk validation\n\nJust type an email address or tell me what you need!',
      timestamp: new Date()
    })
  }

  const sendMessage = async (content: string) => {
    const { token } = useAuth()

    if (!token.value) {
      error.value = 'You must be logged in to use the chat'
      return
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date()
    }
    messages.value.push(userMessage)

    // Set loading state
    isLoading.value = true
    error.value = null

    try {
      // Build conversation history (last 10 messages for context)
      const conversationHistory = messages.value.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // Call chat API
      const response = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({
          message: content,
          conversationHistory: conversationHistory.slice(0, -1) // Exclude the message we just added
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.message,
        validationResults: data.validationResults,
        timestamp: new Date()
      }
      messages.value.push(assistantMessage)

      // Update credits if changed
      if (data.creditsRemaining !== undefined) {
        const { updateCredits } = useAuth()
        updateCredits(data.creditsRemaining)
      }

    } catch (err: any) {
      error.value = err.message

      // Add error message to chat
      messages.value.push({
        id: generateId(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}`,
        timestamp: new Date()
      })
    } finally {
      isLoading.value = false
    }
  }

  const clearMessages = () => {
    messages.value = []
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
