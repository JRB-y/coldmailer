<script setup lang="ts">
import { ref } from 'vue'
import { Send, Upload } from 'lucide-vue-next'

interface Emits {
  (e: 'send', message: string): void
  (e: 'upload'): void
}

const emit = defineEmits<Emits>()

const message = ref('')
const isComposing = ref(false)

const handleSend = () => {
  const trimmed = message.value.trim()
  if (!trimmed) return

  emit('send', trimmed)
  message.value = ''
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey && !isComposing.value) {
    event.preventDefault()
    handleSend()
  }
}

const handleUpload = () => {
  emit('upload')
}
</script>

<template>
  <div class="border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
    <div class="max-w-4xl mx-auto p-4">
      <div class="flex gap-2 items-end">
        <!-- Upload Button -->
        <button
          @click="handleUpload"
          class="flex-shrink-0 p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
          title="Upload CSV file"
        >
          <Upload class="w-5 h-5 text-gray-400" />
        </button>

        <!-- Input -->
        <div class="flex-1 relative">
          <textarea
            v-model="message"
            @keydown="handleKeydown"
            @compositionstart="isComposing = true"
            @compositionend="isComposing = false"
            placeholder="Type a message... (e.g., 'validate john@example.com')"
            rows="1"
            class="w-full px-4 py-3 pr-12 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32"
            style="field-sizing: content;"
          />
        </div>

        <!-- Send Button -->
        <button
          @click="handleSend"
          :disabled="!message.trim()"
          class="flex-shrink-0 p-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors"
          title="Send message"
        >
          <Send class="w-5 h-5 text-white" />
        </button>
      </div>

      <!-- Helper Text -->
      <p class="text-xs text-gray-500 mt-2 text-center">
        Press Enter to send • Shift+Enter for new line
      </p>
    </div>
  </div>
</template>
