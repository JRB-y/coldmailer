<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CheckCircle, XCircle, AlertCircle, LogOut } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  ssr: false
})

const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl

const { token, user, isAuthenticated, logout, updateCredits } = useAuth()
const router = useRouter()

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

const formattedChecks = computed(() => {
  if (!result.value?.checks) return []

  const checks = result.value.checks

  // Format checks by risk priority (aligned with scoring logic)
  return [
    // Critical checks (100 points)
    {
      key: 'format',
      label: 'Format Valid',
      status: checks.syntax === true ? 'pass' : checks.syntax === false ? 'fail' : 'na'
    },
    {
      key: 'dns',
      label: 'DNS Valid',
      status: checks.syntax === false ? 'na' : checks.dns === true ? 'pass' : 'fail'
    },
    {
      key: 'mx',
      label: 'MX Records',
      status: checks.syntax === false ? 'na' : checks.mx === true ? 'pass' : 'fail'
    },
    // Verification check
    {
      key: 'smtp',
      label: 'SMTP Valid',
      status: checks.syntax === false || checks.dns === false ? 'na' : checks.smtp === true ? 'pass' : 'fail'
    },
    // High risk (90 points)
    {
      key: 'disposable',
      label: 'Not Disposable',
      status: checks.syntax === false ? 'na' : checks.disposable ? 'fail' : 'pass'
    },
    // Medium-high risk (20-50 points)
    {
      key: 'domainAge',
      label: 'Domain Age / Pattern',
      status: checks.syntax === false || checks.dns === false ? 'na' :
              (checks.domainAge?.isNew === true || checks.suspiciousPattern === true) ? 'fail' : 'pass'
    },
    // Medium risk (20 points)
    {
      key: 'roleAccount',
      label: 'Not Role Account',
      status: checks.syntax === false ? 'na' : checks.roleAccount ? 'fail' : 'pass'
    },
    // Low risk (10 points)
    {
      key: 'freeDomain',
      label: 'Not Free Domain',
      status: checks.syntax === false ? 'na' : checks.freeEmail ? 'fail' : 'pass'
    }
  ]
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
    // Get token directly from localStorage to ensure it's fresh
    const authToken = localStorage.getItem('auth-token')

    if (!authToken) {
      logout()
      router.push('/auth/login')
      throw new Error('Please login to validate emails.')
    }

    const response = await fetch(`${apiUrl}/api/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ email: email.value.trim() })
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, logout
        logout()
        router.push('/auth/login')
        throw new Error('Session expired. Please login again.')
      }
      if (response.status === 402) {
        throw new Error('Insufficient credits. Please purchase more credits.')
      }
      throw new Error(data.message || data.error || 'Validation failed')
    }

    result.value = data

    // Update credits in local state
    if (data.creditsRemaining !== undefined) {
      updateCredits(data.creditsRemaining)
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

function handleLogout() {
  logout()
  router.push('/auth/login')
}

function reset() {
  email.value = ''
  result.value = null
  error.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-black bg-main">
    <!-- Header -->
    <header class="py-6 px-4 border-b border-gray-800">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <svg width="220" height="60" viewBox="0 0 220 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Envelope icon -->
            <rect x="5" y="10" width="40" height="30" rx="4" stroke="#3B82F6" stroke-width="3" fill="none"/>
            <path d="M5 10 L25 28 L45 10" stroke="#3B82F6" stroke-width="3" fill="none"/>
            <path d="M5 40 L25 22 L45 40" stroke="#3B82F6" stroke-width="3" fill="none"/>

            <!-- Text -->
            <text x="60" y="33" font-family="Inter, Arial, sans-serif" font-weight="600" font-size="24" fill="white">
              Coldmailer
            </text>
          </svg>
        </div>

        <!-- User Info -->
        <div v-if="user" class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-sm text-gray-400">{{ user.email }}</p>
            <p class="text-sm font-semibold text-white">
              <span class="text-blue-400">{{ user.credits }}</span> credits
            </p>
          </div>
          <button
            @click="handleLogout"
            class="p-2 hover:bg-zinc-800 rounded-md transition-colors text-gray-400 hover:text-white"
            title="Logout"
          >
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="py-12 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Hero Text -->
        <div class="text-center mb-12">
          <h2 class="text-4xl md:text-5xl font-bold mb-4 animate-gradient">
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
                v-for="check in formattedChecks"
                :key="check.key"
                class="flex items-center justify-between p-3 bg-black border border-gray-800 rounded-md"
              >
                <span class="text-sm font-medium text-gray-300">
                  {{ check.label }}
                </span>
                <UiBadge
                  :variant="check.status === 'pass' ? 'success' : check.status === 'fail' ? 'destructive' : 'secondary'"
                >
                  {{ check.status === 'pass' ? '✓ Pass' : check.status === 'fail' ? '✗ Fail' : 'N/A' }}
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
<style>
  @keyframes gradientText {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .animate-gradient {
    background: linear-gradient(270deg, #afafaf, #908d95, #a695be, #d3c6e7);
    background-size: 600% 600%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradientText 25s ease infinite;
  }

  /* Dark animated gradient background */
  @keyframes darkGradientBackground {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  /* .bg-main {
    background: linear-gradient(
      -45deg,
      #0a0a0a,
      #171717,
      #1e293b,
      #141415
    );
    background-size: 400% 400%;
    animation: darkGradientBackground 30s ease infinite;
  } */

</style>