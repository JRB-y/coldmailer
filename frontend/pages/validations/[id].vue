<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { CheckCircle, XCircle, AlertCircle, Mail, Shield, Calendar } from 'lucide-vue-next'

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
const { t, locale } = useI18n()

const statusLabels = computed(() => ({
  valid: t('dashboard.statuses.valid'),
  invalid: t('dashboard.statuses.invalid'),
  risky: t('dashboard.statuses.risky'),
  unknown: t('dashboard.statuses.unknown'),
}))

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
      throw new Error(data.error || t('validationDetail.messages.loadError'))
    }

    validation.value = data.validation
  } catch (err: any) {
    error.value = err.message || t('validationDetail.messages.loadError')
  } finally {
    loading.value = false
  }
}

// Format date
function formatDate(dateString: string) {
  const date = new Date(dateString)
  const localeMap: Record<string, string> = {
    en: 'en-US',
    fr: 'fr-FR',
    es: 'es-ES',
    zh: 'zh-CN',
  }

  return date.toLocaleString(localeMap[locale.value] || 'en-US', {
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

function formatCredits(count: number | null | undefined) {
  const value = count || 1
  const key = value === 1 ? 'history.labels.creditSingular' : 'history.labels.creditPlural'
  return t(key, { count: value })
}

function formatDomainAge(days: number | null | undefined) {
  if (days === null || days === undefined) {
    return t('validationDetail.domain.unknown')
  }
  return t('validationDetail.domain.days', { count: days })
}

function formatIsNew(isNew: boolean | null | undefined) {
  if (isNew === null || isNew === undefined) {
    return t('validationDetail.domain.unknown')
  }
  return isNew ? t('validationDetail.domain.isNewYes') : t('validationDetail.domain.isNewNo')
}

onMounted(() => {
  fetchValidation()
})
</script>

<template>
  <div class="min-h-screen bg-black">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8 flex flex-col gap-3">
        <UiBackButton />
        <h1 class="text-2xl md:text-3xl font-bold text-white">
          {{ t('validationDetail.hero.title') }}
        </h1>
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
          {{ t('history.actions.retry') }}
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
                    {{
                      t('jobDetail.summary.creditsUsed', {
                        credits: formatCredits(validation.creditsUsed || 1),
                      })
                    }}
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
                {{ statusLabels[validation.status] || validation.status }}
              </UiBadge>
            </div>
          </div>
        </div>

        <!-- Risk Score -->
        <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Shield class="w-6 h-6 text-gray-400" />
              <h3 class="text-lg font-semibold text-white">{{ t('validationDetail.risk.title') }}</h3>
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
          <h3 class="text-lg font-semibold text-white mb-4">
            {{ t('validationDetail.checks.title') }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Syntax -->
            <div class="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-md">
              <span class="text-sm text-gray-300">
                {{ t('validationDetail.checks.labels.syntax') }}
              </span>
              <div class="flex items-center gap-2">
                <component
                  :is="validation.checks.syntax ? CheckCircle : XCircle"
                  :class="['w-5 h-5', validation.checks.syntax ? 'text-green-400' : 'text-red-400']"
                />
                <span :class="validation.checks.syntax ? 'text-green-400' : 'text-red-400'">
                  {{
                    validation.checks.syntax
                      ? t('validationDetail.checks.status.valid')
                      : t('validationDetail.checks.status.invalid')
                  }}
                </span>
              </div>
            </div>

            <!-- DNS -->
            <div class="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-md">
              <span class="text-sm text-gray-300">
                {{ t('validationDetail.checks.labels.dns') }}
              </span>
              <div class="flex items-center gap-2">
                <component
                  :is="validation.checks.dns ? CheckCircle : XCircle"
                  :class="['w-5 h-5', validation.checks.dns ? 'text-green-400' : 'text-red-400']"
                />
                <span :class="validation.checks.dns ? 'text-green-400' : 'text-red-400'">
                  {{
                    validation.checks.dns
                      ? t('validationDetail.checks.status.found')
                      : t('validationDetail.checks.status.notFound')
                  }}
                </span>
              </div>
            </div>

            <!-- MX -->
            <div class="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-md">
              <span class="text-sm text-gray-300">
                {{ t('validationDetail.checks.labels.mx') }}
              </span>
              <div class="flex items-center gap-2">
                <component
                  :is="validation.checks.mx ? CheckCircle : XCircle"
                  :class="['w-5 h-5', validation.checks.mx ? 'text-green-400' : 'text-red-400']"
                />
                <span :class="validation.checks.mx ? 'text-green-400' : 'text-red-400'">
                  {{
                    validation.checks.mx
                      ? t('validationDetail.checks.status.found')
                      : t('validationDetail.checks.status.notFound')
                  }}
                </span>
              </div>
            </div>

            <!-- SMTP -->
            <div class="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-md">
              <span class="text-sm text-gray-300">
                {{ t('validationDetail.checks.labels.smtp') }}
              </span>
              <div class="flex items-center gap-2">
                <component
                  :is="validation.checks.smtp ? CheckCircle : XCircle"
                  :class="['w-5 h-5', validation.checks.smtp ? 'text-green-400' : 'text-gray-600']"
                />
                <span :class="validation.checks.smtp ? 'text-green-400' : 'text-gray-400'">
                  {{
                    validation.checks.smtp
                      ? t('validationDetail.checks.status.verified')
                      : t('validationDetail.checks.status.notChecked')
                  }}
                </span>
              </div>
            </div>

            <!-- Disposable -->
            <div class="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-md">
              <span class="text-sm text-gray-300">
                {{ t('validationDetail.checks.labels.disposable') }}
              </span>
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
                  {{
                    validation.checks.disposable
                      ? t('validationDetail.checks.status.yes')
                      : t('validationDetail.checks.status.no')
                  }}
                </span>
              </div>
            </div>

            <!-- Free Email -->
            <div class="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-md">
              <span class="text-sm text-gray-300">
                {{ t('validationDetail.checks.labels.freeEmail') }}
              </span>
              <div class="flex items-center gap-2">
                <component
                  :is="validation.checks.freeEmail ? AlertCircle : CheckCircle"
                  :class="[
                    'w-5 h-5',
                    validation.checks.freeEmail ? 'text-gray-400' : 'text-green-400',
                  ]"
                />
                <span :class="validation.checks.freeEmail ? 'text-gray-400' : 'text-green-400'">
                  {{
                    validation.checks.freeEmail
                      ? t('validationDetail.checks.status.yes')
                      : t('validationDetail.checks.status.no')
                  }}
                </span>
              </div>
            </div>

            <!-- Role Account -->
            <div class="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-md">
              <span class="text-sm text-gray-300">
                {{ t('validationDetail.checks.labels.roleAccount') }}
              </span>
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
                  {{
                    validation.checks.roleAccount
                      ? t('validationDetail.checks.status.yes')
                      : t('validationDetail.checks.status.no')
                  }}
                </span>
              </div>
            </div>

            <!-- Suspicious Pattern -->
            <div class="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-md">
              <span class="text-sm text-gray-300">
                {{ t('validationDetail.checks.labels.suspicious') }}
              </span>
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
                  {{
                    validation.checks.suspiciousPattern
                      ? t('validationDetail.checks.status.detected')
                      : t('validationDetail.checks.status.none')
                  }}
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
          <h3 class="text-lg font-semibold text-white mb-4">
            {{ t('validationDetail.domain.title') }}
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-300">
                {{ t('validationDetail.domain.age') }}
              </span>
              <span class="text-sm text-white">
                {{ formatDomainAge(validation.checks.domainAge.daysOld) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-300">
                {{ t('validationDetail.domain.newDomain') }}
              </span>
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
                {{ formatIsNew(validation.checks.domainAge.isNew) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
