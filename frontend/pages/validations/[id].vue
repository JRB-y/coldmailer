<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Mail,
  Shield,
  Calendar,
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  ssr: false,
})

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl

const validationId = route.params.id as string
const validation = ref<any>(null)
const loading = ref(true)
const error = ref('')

// Fetch validation details
async function fetchValidation() {
  loading.value = true
  error.value = ''

  try {
    const authToken = localStorage.getItem('auth-token')
    if (!authToken) {
      router.push('/auth/login')
      return
    }

    const response = await fetch(`${apiUrl}/api/validations/${validationId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load validation')
    }

    validation.value = data.validation
  } catch (err: any) {
    error.value = err.message || 'Failed to load validation'
  } finally {
    loading.value = false
  }
}

// Format date
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get status icon
function getStatusIcon(status: string) {
  switch (status) {
    case 'valid':
      return CheckCircle
    case 'invalid':
      return XCircle
    default:
      return AlertCircle
  }
}

// Get status color
function getStatusColor(status: string) {
  switch (status) {
    case 'valid':
      return 'text-green-400'
    case 'invalid':
      return 'text-red-400'
    case 'risky':
      return 'text-yellow-400'
    default:
      return 'text-gray-400'
  }
}

onMounted(() => {
  fetchValidation()
})
</script>

<template>
  <div class="min-h-screen bg-black">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <UiButton
          variant="ghost"
          size="sm"
          class="mb-4 text-gray-400 hover:text-white"
          @click="router.back()"
        >
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back
        </UiButton>

        <h1 class="text-2xl md:text-3xl font-bold text-white">Validation Details</h1>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center"
      >
        <XCircle class="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p class="text-red-400">{{ error }}</p>
        <UiButton @click="fetchValidation" variant="destructive" size="sm" class="mt-4">
          Retry
        </UiButton>
      </div>

      <!-- Validation Content -->
      <div v-else-if="validation" class="space-y-6">
        <!-- Email Header -->
        <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <Mail class="w-8 h-8 text-gray-400" />
              <div>
                <h2 class="text-xl font-semibold text-white font-mono">{{ validation.email }}</h2>
                <div class="flex items-center gap-2 mt-1">
                  <p class="text-sm text-gray-400">
                    <Calendar class="w-4 h-4 inline mr-1" />
                    {{ formatDate(validation.createdAt) }}
                  </p>
                  <span class="text-xs text-gray-700">·</span>
                  <p class="text-xs text-gray-500">
                    {{ validation.creditsUsed || 1 }} credit used
                  </p>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <component
                :is="getStatusIcon(validation.status)"
                :class="['w-8 h-8', getStatusColor(validation.status)]"
              />
              <UiBadge
                :variant="
                  validation.status === 'valid'
                    ? 'success'
                    : validation.status === 'invalid'
                      ? 'destructive'
                      : 'warning'
                "
                class="text-sm"
              >
                {{ validation.status.toUpperCase() }}
              </UiBadge>
            </div>
          </div>
        </div>

        <!-- Risk Score -->
        <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Shield class="w-6 h-6 text-gray-400" />
              <h3 class="text-lg font-semibold text-white">Risk Score</h3>
            </div>
            <div
              :class="[
                'text-4xl font-bold',
                validation.riskScore >= 70
                  ? 'text-red-400'
                  : validation.riskScore >= 40
                    ? 'text-yellow-400'
                    : 'text-green-400',
              ]"
            >
              {{ validation.riskScore }}<span class="text-2xl text-gray-500">/100</span>
            </div>
          </div>
          <p v-if="validation.reason" class="text-sm text-gray-400 mt-4">
            {{ validation.reason }}
          </p>
        </div>

        <!-- Checks -->
        <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Validation Checks</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Syntax -->
            <div class="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-md">
              <span class="text-sm text-gray-300">Syntax</span>
              <div class="flex items-center gap-2">
                <component
                  :is="validation.checks.syntax ? CheckCircle : XCircle"
                  :class="['w-5 h-5', validation.checks.syntax ? 'text-green-400' : 'text-red-400']"
                />
                <span :class="validation.checks.syntax ? 'text-green-400' : 'text-red-400'">
                  {{ validation.checks.syntax ? 'Valid' : 'Invalid' }}
                </span>
              </div>
            </div>

            <!-- DNS -->
            <div class="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-md">
              <span class="text-sm text-gray-300">DNS Records</span>
              <div class="flex items-center gap-2">
                <component
                  :is="validation.checks.dns ? CheckCircle : XCircle"
                  :class="['w-5 h-5', validation.checks.dns ? 'text-green-400' : 'text-red-400']"
                />
                <span :class="validation.checks.dns ? 'text-green-400' : 'text-red-400'">
                  {{ validation.checks.dns ? 'Found' : 'Not Found' }}
                </span>
              </div>
            </div>

            <!-- MX -->
            <div class="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-md">
              <span class="text-sm text-gray-300">MX Records</span>
              <div class="flex items-center gap-2">
                <component
                  :is="validation.checks.mx ? CheckCircle : XCircle"
                  :class="['w-5 h-5', validation.checks.mx ? 'text-green-400' : 'text-red-400']"
                />
                <span :class="validation.checks.mx ? 'text-green-400' : 'text-red-400'">
                  {{ validation.checks.mx ? 'Found' : 'Not Found' }}
                </span>
              </div>
            </div>

            <!-- SMTP -->
            <div class="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-md">
              <span class="text-sm text-gray-300">SMTP Verification</span>
              <div class="flex items-center gap-2">
                <component
                  :is="validation.checks.smtp ? CheckCircle : XCircle"
                  :class="['w-5 h-5', validation.checks.smtp ? 'text-green-400' : 'text-gray-600']"
                />
                <span :class="validation.checks.smtp ? 'text-green-400' : 'text-gray-400'">
                  {{ validation.checks.smtp ? 'Verified' : 'Not Checked' }}
                </span>
              </div>
            </div>

            <!-- Disposable -->
            <div class="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-md">
              <span class="text-sm text-gray-300">Disposable Email</span>
              <div class="flex items-center gap-2">
                <component
                  :is="!validation.checks.disposable ? CheckCircle : AlertCircle"
                  :class="[
                    'w-5 h-5',
                    !validation.checks.disposable ? 'text-green-400' : 'text-yellow-400',
                  ]"
                />
                <span
                  :class="!validation.checks.disposable ? 'text-green-400' : 'text-yellow-400'"
                >
                  {{ validation.checks.disposable ? 'Yes' : 'No' }}
                </span>
              </div>
            </div>

            <!-- Free Email -->
            <div class="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-md">
              <span class="text-sm text-gray-300">Free Email Provider</span>
              <div class="flex items-center gap-2">
                <component
                  :is="validation.checks.freeEmail ? AlertCircle : CheckCircle"
                  :class="[
                    'w-5 h-5',
                    validation.checks.freeEmail ? 'text-gray-400' : 'text-green-400',
                  ]"
                />
                <span :class="validation.checks.freeEmail ? 'text-gray-400' : 'text-green-400'">
                  {{ validation.checks.freeEmail ? 'Yes' : 'No' }}
                </span>
              </div>
            </div>

            <!-- Role Account -->
            <div class="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-md">
              <span class="text-sm text-gray-300">Role Account</span>
              <div class="flex items-center gap-2">
                <component
                  :is="!validation.checks.roleAccount ? CheckCircle : AlertCircle"
                  :class="[
                    'w-5 h-5',
                    !validation.checks.roleAccount ? 'text-green-400' : 'text-yellow-400',
                  ]"
                />
                <span
                  :class="!validation.checks.roleAccount ? 'text-green-400' : 'text-yellow-400'"
                >
                  {{ validation.checks.roleAccount ? 'Yes' : 'No' }}
                </span>
              </div>
            </div>

            <!-- Suspicious Pattern -->
            <div class="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-md">
              <span class="text-sm text-gray-300">Suspicious Pattern</span>
              <div class="flex items-center gap-2">
                <component
                  :is="!validation.checks.suspiciousPattern ? CheckCircle : AlertCircle"
                  :class="[
                    'w-5 h-5',
                    !validation.checks.suspiciousPattern ? 'text-green-400' : 'text-yellow-400',
                  ]"
                />
                <span
                  :class="
                    !validation.checks.suspiciousPattern ? 'text-green-400' : 'text-yellow-400'
                  "
                >
                  {{ validation.checks.suspiciousPattern ? 'Detected' : 'None' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Domain Age -->
        <div
          v-if="validation.checks.domainAge"
          class="bg-zinc-900 border border-gray-800 rounded-lg p-6"
        >
          <h3 class="text-lg font-semibold text-white mb-4">Domain Information</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-300">Domain Age</span>
              <span class="text-sm text-white">
                {{ validation.checks.domainAge.daysOld !== null
                  ? `${validation.checks.domainAge.daysOld} days`
                  : 'Unknown' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-300">New Domain</span>
              <span
                :class="[
                  'text-sm',
                  validation.checks.domainAge.isNew === null
                    ? 'text-gray-400'
                    : validation.checks.domainAge.isNew
                      ? 'text-yellow-400'
                      : 'text-green-400',
                ]"
              >
                {{
                  validation.checks.domainAge.isNew === null
                    ? 'Unknown'
                    : validation.checks.domainAge.isNew
                      ? 'Yes (< 90 days)'
                      : 'No'
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
