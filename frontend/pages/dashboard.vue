<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  BarChart3,
  Clock,
  TrendingUp,
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  ssr: false,
})

const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl

const { t, locale } = useI18n()
const localePath = useLocalePath()

const { user, logout, updateCredits, fetchUser } = useAuth()
const router = useRouter()

const formattedCredits = computed(() => {
  const credits = user.value?.credits ?? 0
  try {
    return new Intl.NumberFormat(locale.value).format(credits)
  } catch (error) {
    return credits.toString()
  }
})

const email = ref('')
const loading = ref(false)
const result = ref<any>(null)
const error = ref('')
const recentValidations = ref<any[]>([])
const stats = ref({
  totalValidations: 0,
  validCount: 0,
  invalidCount: 0,
  riskyCount: 0,
})

// Status helpers
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

  return [
    {
      key: 'format',
      label: t('dashboard.checks.format'),
      status: checks.syntax === true ? 'pass' : checks.syntax === false ? 'fail' : 'na',
    },
    {
      key: 'dns',
      label: t('dashboard.checks.dns'),
      status: checks.syntax === false ? 'na' : checks.dns === true ? 'pass' : 'fail',
    },
    {
      key: 'mx',
      label: t('dashboard.checks.mx'),
      status: checks.syntax === false ? 'na' : checks.mx === true ? 'pass' : 'fail',
    },
    {
      key: 'smtp',
      label: t('dashboard.checks.smtp'),
      status:
        checks.syntax === false || checks.dns === false
          ? 'na'
          : checks.smtp === true
            ? 'pass'
            : 'fail',
    },
    {
      key: 'disposable',
      label: t('dashboard.checks.disposable'),
      status: checks.syntax === false ? 'na' : checks.disposable ? 'fail' : 'pass',
    },
    {
      key: 'domainAge',
      label: t('dashboard.checks.domainAge'),
      status:
        checks.syntax === false || checks.dns === false
          ? 'na'
          : checks.domainAge?.isNew === true || checks.suspiciousPattern === true
            ? 'fail'
            : 'pass',
    },
    {
      key: 'roleAccount',
      label: t('dashboard.checks.roleAccount'),
      status: checks.syntax === false ? 'na' : checks.roleAccount ? 'fail' : 'pass',
    },
    {
      key: 'freeDomain',
      label: t('dashboard.checks.freeDomain'),
      status: checks.syntax === false ? 'na' : checks.freeEmail ? 'fail' : 'pass',
    },
  ]
})

function getCheckStatusLabel(status: 'pass' | 'fail' | 'na') {
  if (status === 'pass') return t('dashboard.checkStatus.pass')
  if (status === 'fail') return t('dashboard.checkStatus.fail')
  return t('dashboard.checkStatus.na')
}

const resultStatusLabel = computed(() => {
  if (!result.value) return ''
  switch (result.value.status) {
    case 'valid':
      return t('dashboard.statuses.valid')
    case 'invalid':
      return t('dashboard.statuses.invalid')
    case 'risky':
      return t('dashboard.statuses.risky')
    default:
      return t('dashboard.statuses.unknown')
  }
})

// Validate email
async function validateEmail() {
  if (!email.value.trim()) {
    error.value = t('dashboard.errors.required')
    return
  }

  loading.value = true
  error.value = ''
  result.value = null

  try {
    const authToken = localStorage.getItem('auth-token')

    if (!authToken) {
      router.push(localePath('/auth/login'))
      return
    }

    const response = await fetch(`${apiUrl}/api/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ email: email.value.trim() }),
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        logout()
        router.push(localePath('/auth/login'))
        throw new Error(t('dashboard.errors.sessionExpired'))
      }
      if (response.status === 402) {
        throw new Error(t('dashboard.errors.insufficientCredits'))
      }
      throw new Error(data.message || data.error || t('dashboard.errors.validationFailed'))
    }

    result.value = data

    // Update credits locally for immediate UI update
    if (data.creditsRemaining !== undefined) {
      updateCredits(data.creditsRemaining)
    }

    // Fetch latest user data from server to ensure sync
    await fetchUser()

    // Refresh stats
    await fetchStats()
  } catch (err: any) {
    error.value = err?.message || t('dashboard.errors.generic')
  } finally {
    loading.value = false
  }
}

// Fetch stats
async function fetchStats() {
  try {
    const authToken = localStorage.getItem('auth-token')
    if (!authToken) return

    const response = await fetch(`${apiUrl}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })

    const data = await response.json()

    if (response.ok) {
      // Update stats from aggregated data
      stats.value.totalValidations = data.totalValidations || 0
      stats.value.validCount = data.validCount || 0
      stats.value.invalidCount = data.invalidCount || 0
      stats.value.riskyCount = data.riskyCount || 0

      // Update recent validations
      recentValidations.value = data.recentValidations || []
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

// Load stats on mount
onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="mb-8 flex flex-col gap-3">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">
            {{ t('dashboard.title') }}
          </h1>
          <p class="text-gray-400">
            {{ t('dashboard.subtitle') }}
          </p>
        </div>
        <div
          v-if="user"
          class="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
        >
          <span
            class="flex h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"
          ></span>
          <span class="font-semibold tracking-wide">
            {{ t('dashboard.creditsLabel', { credits: formattedCredits }) }}
          </span>
        </div>
      </div>
    </div>

    <LowCreditWarning />

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-400 text-sm">{{ t('dashboard.stats.total') }}</span>
          <BarChart3 class="w-5 h-5 text-blue-400" />
        </div>
        <div class="text-3xl font-bold text-white">{{ stats.totalValidations }}</div>
      </div>

      <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-400 text-sm">{{ t('dashboard.stats.valid') }}</span>
          <CheckCircle class="w-5 h-5 text-green-400" />
        </div>
        <div class="text-3xl font-bold text-green-400">{{ stats.validCount }}</div>
      </div>

      <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-400 text-sm">{{ t('dashboard.stats.risky') }}</span>
          <AlertCircle class="w-5 h-5 text-yellow-400" />
        </div>
        <div class="text-3xl font-bold text-yellow-400">{{ stats.riskyCount }}</div>
      </div>

      <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-400 text-sm">{{ t('dashboard.stats.invalid') }}</span>
          <XCircle class="w-5 h-5 text-red-400" />
        </div>
        <div class="text-3xl font-bold text-red-400">{{ stats.invalidCount }}</div>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-8">
      <!-- Validation Form -->
      <div class="lg:col-span-2">
        <div class="bg-zinc-900 border border-gray-800 rounded-lg p-8">
          <div class="mb-6 flex items-center justify-between gap-4">
            <h2 class="text-xl font-bold text-white">
              {{ t('dashboard.validate.title') }}
            </h2>
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
            >
              <div
                v-if="loading"
                class="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300"
              >
                <span class="relative flex h-2 w-12 overflow-hidden rounded-full bg-blue-500/20">
                  <span
                    class="absolute inset-0 h-full w-1/2 animate-[pulse_800ms_ease-in-out_infinite] bg-gradient-to-r from-blue-400/60 via-purple-400/60 to-transparent"
                  ></span>
                </span>
                {{ t('dashboard.validate.loading') }}
              </div>
            </Transition>
          </div>

          <form @submit.prevent="validateEmail" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                {{ t('dashboard.validate.label') }}
              </label>
              <UiInput
                id="email"
                v-model="email"
                type="email"
                :placeholder="t('dashboard.validate.placeholder')"
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
                {{ loading ? t('dashboard.validate.loading') : t('dashboard.validate.button') }}
              </UiButton>

              <UiButton
                v-if="result"
                type="button"
                variant="outline"
                size="lg"
                class="border-gray-700 text-gray-300 hover:bg-zinc-800 bg-black"
                @click="reset"
              >
                {{ t('dashboard.validate.reset') }}
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
                <component :is="statusIcon" :class="['w-12 h-12', statusColor]" />
                <div class="flex-1">
                  <h3 class="text-2xl font-bold" :class="statusColor">
                    {{ resultStatusLabel }}
                  </h3>
                  <p class="text-gray-400">{{ result.email }}</p>
                </div>
                <UiBadge :variant="statusBadgeVariant" class="text-lg px-4 py-1">
                  {{ t('dashboard.result.risk', { score: result.riskScore }) }}
                </UiBadge>
              </div>

              <p v-if="result.reason" class="text-gray-300 mt-2">
                <span class="font-semibold">{{ t('dashboard.result.reason') }}</span>
                {{ result.reason }}
              </p>
            </div>

            <!-- Detailed Checks -->
            <div class="p-6 bg-black border border-gray-800 rounded-lg">
              <h4 class="text-lg font-semibold mb-4 text-white">
                {{ t('dashboard.result.checksTitle') }}
              </h4>
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
                    :variant="
                      check.status === 'pass'
                        ? 'success'
                        : check.status === 'fail'
                          ? 'destructive'
                          : 'secondary'
                    "
                  >
                    {{ getCheckStatusLabel(check.status) }}
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
          <h3 class="text-lg font-semibold text-white mb-4">
            {{ t('dashboard.quickActions.title') }}
          </h3>
          <div class="space-y-3">
            <NuxtLink
              :to="localePath('/history')"
              class="block p-3 bg-black border border-gray-800 rounded-md hover:border-blue-500/50 transition-colors"
            >
              <div class="flex items-center gap-3">
                <Clock class="w-5 h-5 text-blue-400" />
                <div>
                  <div class="text-sm font-medium text-white">
                    {{ t('dashboard.quickActions.history.title') }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ t('dashboard.quickActions.history.subtitle') }}
                  </div>
                </div>
              </div>
            </NuxtLink>

            <NuxtLink
              :to="localePath('/bulk')"
              class="block p-3 bg-black border border-gray-800 rounded-md hover:border-purple-500/50 transition-colors"
            >
              <div class="flex items-center gap-3">
                <Mail class="w-5 h-5 text-purple-400" />
                <div>
                  <div class="text-sm font-medium text-white">
                    {{ t('dashboard.quickActions.bulk.title') }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ t('dashboard.quickActions.bulk.subtitle') }}
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
