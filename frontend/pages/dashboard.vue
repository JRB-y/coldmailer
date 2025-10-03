<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CheckCircle, XCircle, AlertCircle, LogOut, Mail, BarChart3, Clock, TrendingUp } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  ssr: false
})

const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl

const { user, logout, updateCredits } = useAuth()
const router = useRouter()

const email = ref('')
const loading = ref(false)
const result = ref<any>(null)
const error = ref('')
const recentValidations = ref<any[]>([])
const stats = ref({
  totalValidations: 0,
  validCount: 0,
  invalidCount: 0,
  riskyCount: 0
})

// Status helpers
const statusIcon = computed(() => {
  if (!result.value) return null

  switch (result.value.status) {
    case 'valid': return CheckCircle
    case 'invalid': return XCircle
    case 'risky': return AlertCircle
    default: return AlertCircle
  }
})

const statusColor = computed(() => {
  if (!result.value) return ''

  switch (result.value.status) {
    case 'valid': return 'text-green-400'
    case 'invalid': return 'text-red-400'
    case 'risky': return 'text-yellow-400'
    default: return 'text-gray-400'
  }
})

const statusBadgeVariant = computed(() => {
  if (!result.value) return 'default'

  switch (result.value.status) {
    case 'valid': return 'success'
    case 'invalid': return 'destructive'
    case 'risky': return 'warning'
    default: return 'secondary'
  }
})

const formattedChecks = computed(() => {
  if (!result.value?.checks) return []

  const checks = result.value.checks

  return [
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
    {
      key: 'smtp',
      label: 'SMTP Valid',
      status: checks.syntax === false || checks.dns === false ? 'na' : checks.smtp === true ? 'pass' : 'fail'
    },
    {
      key: 'disposable',
      label: 'Not Disposable',
      status: checks.syntax === false ? 'na' : checks.disposable ? 'fail' : 'pass'
    },
    {
      key: 'domainAge',
      label: 'Domain Age / Pattern',
      status: checks.syntax === false || checks.dns === false ? 'na' :
              (checks.domainAge?.isNew === true || checks.suspiciousPattern === true) ? 'fail' : 'pass'
    },
    {
      key: 'roleAccount',
      label: 'Not Role Account',
      status: checks.syntax === false ? 'na' : checks.roleAccount ? 'fail' : 'pass'
    },
    {
      key: 'freeDomain',
      label: 'Not Free Domain',
      status: checks.syntax === false ? 'na' : checks.freeEmail ? 'fail' : 'pass'
    }
  ]
})

// Validate email
async function validateEmail() {
  if (!email.value.trim()) {
    error.value = 'Please enter an email address'
    return
  }

  loading.value = true
  error.value = ''
  result.value = null

  try {
    const authToken = localStorage.getItem('auth-token')

    if (!authToken) {
      router.push('/auth/login')
      return
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

    // Update credits
    if (data.creditsRemaining !== undefined) {
      updateCredits(data.creditsRemaining)
    }

    // Refresh stats
    await fetchStats()
  } catch (err: any) {
    error.value = err.message || 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

// Fetch stats
async function fetchStats() {
  try {
    const authToken = localStorage.getItem('auth-token')
    if (!authToken) return

    const response = await fetch(`${apiUrl}/api/validations?limit=5`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })

    const data = await response.json()

    if (response.ok && data.validations) {
      recentValidations.value = data.validations

      // Calculate stats
      stats.value.totalValidations = data.pagination.total || 0
      stats.value.validCount = recentValidations.value.filter((v: any) => v.status === 'valid').length
      stats.value.invalidCount = recentValidations.value.filter((v: any) => v.status === 'invalid').length
      stats.value.riskyCount = recentValidations.value.filter((v: any) => v.status === 'risky').length
    }
  } catch (err) {
    console.error('Failed to fetch stats:', err)
  }
}

function reset() {
  email.value = ''
  result.value = null
  error.value = ''
}

function handleLogout() {
  logout()
  router.push('/')
}

// Load stats on mount
onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="min-h-screen bg-black">
    <!-- Header -->
    <UiHeader />


    <!-- Main Content -->
    <main class="py-12 px-4">
      <div class="max-w-7xl mx-auto">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p class="text-gray-400">Validate emails and track your usage</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-400 text-sm">Total Validations</span>
              <BarChart3 class="w-5 h-5 text-blue-400" />
            </div>
            <div class="text-3xl font-bold text-white">{{ stats.totalValidations }}</div>
          </div>

          <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-400 text-sm">Valid</span>
              <CheckCircle class="w-5 h-5 text-green-400" />
            </div>
            <div class="text-3xl font-bold text-green-400">{{ stats.validCount }}</div>
          </div>

          <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-400 text-sm">Risky</span>
              <AlertCircle class="w-5 h-5 text-yellow-400" />
            </div>
            <div class="text-3xl font-bold text-yellow-400">{{ stats.riskyCount }}</div>
          </div>

          <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-400 text-sm">Invalid</span>
              <XCircle class="w-5 h-5 text-red-400" />
            </div>
            <div class="text-3xl font-bold text-red-400">{{ stats.invalidCount }}</div>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Validation Form -->
          <div class="lg:col-span-2">
            <div class="bg-zinc-900 border border-gray-800 rounded-lg p-8">
              <h2 class="text-xl font-bold text-white mb-6">Single Email Validation</h2>

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
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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

              <!-- Results -->
              <div v-if="result" class="mt-8 space-y-4">
                <!-- Status Card -->
                <div class="p-6 bg-black border border-gray-800 rounded-lg">
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
                </div>

                <!-- Detailed Checks -->
                <div class="p-6 bg-black border border-gray-800 rounded-lg">
                  <h4 class="text-lg font-semibold mb-4 text-white">Validation Checks</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      v-for="check in formattedChecks"
                      :key="check.key"
                      class="flex items-center justify-between p-3 bg-zinc-900 border border-gray-800 rounded-md"
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
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Quick Stats -->
            <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div class="space-y-3">
                <NuxtLink
                  to="/history"
                  class="block p-3 bg-black border border-gray-800 rounded-md hover:border-blue-500/50 transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <Clock class="w-5 h-5 text-blue-400" />
                    <div>
                      <div class="text-sm font-medium text-white">View History</div>
                      <div class="text-xs text-gray-500">See all validations</div>
                    </div>
                  </div>
                </NuxtLink>

                <div class="block p-3 bg-black border border-gray-800 rounded-md opacity-50">
                  <div class="flex items-center gap-3">
                    <Mail class="w-5 h-5 text-purple-400" />
                    <div>
                      <div class="text-sm font-medium text-white">Bulk Validation</div>
                      <div class="text-xs text-gray-500">Coming soon</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
