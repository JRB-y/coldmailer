<script setup lang="ts">
import { ref, computed } from 'vue'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-vue-next'

const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl

const email = ref('')
const loading = ref(false)
const result = ref<any>(null)
const error = ref('')

const statusIcon = computed(() => {
  if (!result.value) return null

  switch (result.value.status) {
    case 'valid':
      return CheckCircle
    case 'invalid':
      return XCircle
    case 'risky':
      return AlertCircle
    default:
      return AlertCircle
  }
})

const statusColor = computed(() => {
  if (!result.value) return ''

  switch (result.value.status) {
    case 'valid':
      return 'text-green-400'
    case 'invalid':
      return 'text-red-400'
    case 'risky':
      return 'text-yellow-400'
    default:
      return 'text-gray-400'
  }
})

const statusBadgeVariant = computed(() => {
  if (!result.value) return 'default'

  switch (result.value.status) {
    case 'valid':
      return 'success'
    case 'invalid':
      return 'destructive'
    case 'risky':
      return 'warning'
    default:
      return 'secondary'
  }
})

async function validateEmail() {
  if (!email.value.trim()) {
    error.value = 'Please enter an email address'
    return
  }

  loading.value = true
  error.value = ''
  result.value = null

  try {
    const response = await fetch(`${apiUrl}/api/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.value.trim() })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Validation failed')
    }

    result.value = data
  } catch (err: any) {
    error.value = err.message || 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

function reset() {
  email.value = ''
  result.value = null
  error.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-black">
    <!-- Header -->
    <header class="py-6 px-4 border-b border-gray-800">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-2xl font-bold text-white">Coldmailer</h1>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="py-12 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Hero Text -->
        <div class="text-center mb-12">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">
            Validate emails before you send.
          </h2>
          <p class="text-xl text-gray-400">
            Protect your domain reputation. Reduce bounces. Increase deliverability.
          </p>
        </div>

        <!-- Validation Form -->
        <UiCard class="p-8 max-w-2xl mx-auto bg-zinc-900 border-gray-800">
          <form @submit.prevent="validateEmail" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <UiInput
                id="email"
                v-model="email"
                type="email"
                placeholder="test@example.com"
                :disabled="loading"
                class="text-lg bg-black border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <div class="flex gap-3">
              <UiButton
                type="submit"
                :disabled="loading"
                size="lg"
                class="flex-1 bg-white text-black hover:bg-gray-200"
              >
                {{ loading ? 'Validating...' : 'Validate Email' }}
              </UiButton>

              <UiButton
                v-if="result"
                type="button"
                variant="outline"
                size="lg"
                class="border-gray-700 text-gray-300 hover:bg-zinc-800"
                @click="reset"
              >
                Reset
              </UiButton>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="p-4 bg-red-950/50 border border-red-800 rounded-md">
              <p class="text-sm text-red-400">{{ error }}</p>
            </div>
          </form>
        </UiCard>

        <!-- Results -->
        <div v-if="result" class="mt-8 max-w-2xl mx-auto space-y-4">
          <!-- Status Card -->
          <UiCard class="p-6 bg-zinc-900 border-gray-800">
            <div class="flex items-center gap-4 mb-4">
              <component
                :is="statusIcon"
                :class="['w-12 h-12', statusColor]"
              />
              <div class="flex-1">
                <h3 class="text-2xl font-bold" :class="statusColor">
                  {{ result.status.charAt(0).toUpperCase() + result.status.slice(1) }}
                </h3>
                <p class="text-gray-400">{{ result.email }}</p>
              </div>
              <UiBadge :variant="statusBadgeVariant" class="text-lg px-4 py-1">
                Risk: {{ result.riskScore }}/100
              </UiBadge>
            </div>

            <p v-if="result.reason" class="text-gray-300 mt-2">
              <span class="font-semibold">Reason:</span> {{ result.reason }}
            </p>
          </UiCard>

          <!-- Detailed Checks -->
          <UiCard class="p-6 bg-zinc-900 border-gray-800">
            <h4 class="text-lg font-semibold mb-4 text-white">Validation Checks</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="(value, key) in result.checks"
                :key="key"
                class="flex items-center justify-between p-3 bg-black border border-gray-800 rounded-md"
              >
                <span class="text-sm font-medium text-gray-300 capitalize">
                  {{ key.replace(/([A-Z])/g, ' $1').trim() }}
                </span>
                <UiBadge
                  :variant="value === true ? 'success' : value === false ? 'destructive' : 'secondary'"
                >
                  {{ value === true ? '✓ Pass' : value === false ? '✗ Fail' : 'N/A' }}
                </UiBadge>
              </div>
            </div>
          </UiCard>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-8 px-4 mt-16 border-t border-gray-800">
      <div class="max-w-6xl mx-auto text-center text-gray-500">
        <p>&copy; 2025 Coldmailer. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>
