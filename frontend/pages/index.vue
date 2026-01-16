<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { Loader2, Mail } from 'lucide-vue-next'

definePageMeta({ ssr: false })

const { isAuthenticated, user } = useAuth()
const localePath = useLocalePath()
const { t } = useI18n()

// Chat state
const { messages, isLoading, sendMessage } = useChat()
const messageListRef = ref<HTMLElement>()

// File upload state
const fileInputRef = ref<HTMLInputElement>()
const uploadingFile = ref(false)

// Auto-scroll to bottom when new messages arrive
watch(() => messages.value.length, async () => {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
})

const handleSendMessage = async (content: string) => {
  await sendMessage(content)
}

const handleUploadClick = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  if (!file.name.endsWith('.csv')) {
    await sendMessage(`I tried to upload a file named "${file.name}" but it's not a CSV file. Please upload only CSV files.`)
    return
  }

  uploadingFile.value = true

  try {
    // Use the existing bulk upload API
    const { token } = useAuth()
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('http://localhost:4000/api/bulk/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      await sendMessage(`Error uploading file: ${data.error || 'Unknown error'}`)
      return
    }

    // Send a message about the upload
    await sendMessage(`I've uploaded the file "${file.name}" with ${data.totalEmails} emails. The validation job has been created (Job ID: ${data.jobId}). You can check the status by asking me about job ${data.jobId}.`)

  } catch (error: any) {
    await sendMessage(`Error uploading file: ${error.message}`)
  } finally {
    uploadingFile.value = false
    // Reset file input
    if (target) target.value = ''
  }
}
</script>

<template>
  <div class="h-screen flex flex-col">
    <!-- Non-authenticated users: Show simple hero with login prompt -->
    <div v-if="!isAuthenticated" class="flex-1 flex items-center justify-center">
      <div class="text-center max-w-2xl mx-auto px-6">
        <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-5xl md:text-6xl font-bold mb-6">
          <span class="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Email Validation
          </span>
          <br />
          <span class="text-white">Powered by AI</span>
        </h1>
        <p class="text-xl text-gray-400 mb-10">
          Chat with our AI assistant to validate emails, check deliverability, and maintain a clean email list.
        </p>

        <div class="flex items-center justify-center gap-4 mb-12">
          <NuxtLink
            :to="localePath('/auth/signup')"
            class="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[1px] text-white shadow-[0_0_0_rgba(0,0,0,0)] transition-all duration-300 hover:shadow-[0_0_32px_rgba(168,85,247,0.35)]"
          >
            <span class="flex items-center gap-3 rounded-full bg-zinc-950/90 px-9 py-3 text-lg font-semibold transition-all duration-300 group-hover:bg-transparent">
              Get Started Free
            </span>
          </NuxtLink>

          <NuxtLink
            :to="localePath('/auth/login')"
            class="px-9 py-3 text-lg font-semibold text-gray-300 hover:text-white transition-colors"
          >
            Sign In
          </NuxtLink>
        </div>

        <!-- Features -->
        <div class="grid md:grid-cols-3 gap-6 text-left">
          <div class="bg-zinc-900 border border-gray-800 rounded-xl p-6">
            <h3 class="text-white font-semibold mb-2">AI-Powered Chat</h3>
            <p class="text-gray-400 text-sm">Natural conversation interface for email validation</p>
          </div>
          <div class="bg-zinc-900 border border-gray-800 rounded-xl p-6">
            <h3 class="text-white font-semibold mb-2">Bulk Validation</h3>
            <p class="text-gray-400 text-sm">Upload CSV files and validate thousands of emails</p>
          </div>
          <div class="bg-zinc-900 border border-gray-800 rounded-xl p-6">
            <h3 class="text-white font-semibold mb-2">Real-time Results</h3>
            <p class="text-gray-400 text-sm">Get instant validation results with risk scores</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Authenticated users: Show chat interface -->
    <div v-else class="flex-1 flex flex-col max-w-5xl mx-auto w-full">
      <!-- Header -->
      <div class="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-white">Email Validation Assistant</h1>
            <p class="text-sm text-gray-400">Powered by AI</p>
          </div>
          <div v-if="user" class="text-right">
            <p class="text-sm text-gray-400">Credits Remaining</p>
            <p class="text-2xl font-bold text-blue-400">{{ user.credits }}</p>
          </div>
        </div>
      </div>

      <!-- Messages Container -->
      <div
        ref="messageListRef"
        class="flex-1 overflow-y-auto px-6 py-8"
      >
        <div class="max-w-4xl mx-auto space-y-4">
          <!-- Loading indicator at top -->
          <div v-if="isLoading" class="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 class="w-4 h-4 animate-spin" />
            <span>AI is thinking...</span>
          </div>

          <!-- Messages -->
          <ChatMessage
            v-for="message in messages"
            :key="message.id"
            :role="message.role"
            :content="message.content"
            :validation-results="message.validationResults"
            :timestamp="message.timestamp"
          />

          <!-- File upload indicator -->
          <div v-if="uploadingFile" class="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 class="w-4 h-4 animate-spin" />
            <span>Uploading file...</span>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <ChatInput
        @send="handleSendMessage"
        @upload="handleUploadClick"
      />

      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        accept=".csv"
        class="hidden"
        @change="handleFileSelect"
      />
    </div>
  </div>
</template>
