<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
  FileText,
  Eye,
  Download,
  Mail,
  Layers,
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  ssr: false,
})

const { getJobs, downloadResults } = useBulk()
const router = useRouter()
const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl

const history = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const { t, locale } = useI18n()

const jobStatusLabels = computed(() => ({
  completed: t('bulk.jobs.status.completed'),
  failed: t('bulk.jobs.status.failed'),
  processing: t('bulk.jobs.status.processing'),
  pending: t('bulk.jobs.status.pending'),
}))

const validationStatusLabels = computed(() => ({
  valid: t('dashboard.statuses.valid'),
  invalid: t('dashboard.statuses.invalid'),
  risky: t('dashboard.statuses.risky'),
  unknown: t('dashboard.statuses.unknown'),
}))

// Fetch both individual validations and jobs
async function fetchHistory() {
  loading.value = true
  error.value = ''

  try {
    const authToken = localStorage.getItem('auth-token')
    if (!authToken) {
      router.push('/auth/login')
      return
    }

    // Fetch individual validations (without jobId)
    const validationsRes = await fetch(`${apiUrl}/api/validations?limit=100`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    const validationsData = await validationsRes.json()

    // Fetch all jobs
    const jobsResult = await getJobs()

    if (!validationsRes.ok && !jobsResult.success) {
      throw new Error(t('history.messages.loadError'))
    }

    // Filter validations without jobId (individual email validations)
    const individualValidations = (validationsData.validations || [])
      .filter((v: any) => !v.jobId)
      .map((v: any) => ({ ...v, type: 'validation' }))

    // Map jobs
    const jobs = (jobsResult.jobs || []).map((j: any) => ({ ...j, type: 'job' }))

    // Merge and sort by date
    const merged = [...individualValidations, ...jobs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    history.value = merged
  } catch (err: any) {
    error.value = err.message || t('history.messages.loadError')
  } finally {
    loading.value = false
  }
}

// Format date
function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return t('history.time.justNow')
  if (diffMins < 60) return t('history.time.minutesAgo', { count: diffMins })
  if (diffHours < 24) return t('history.time.hoursAgo', { count: diffHours })
  if (diffDays < 7) return t('history.time.daysAgo', { count: diffDays })

  const localeMap: Record<string, string> = {
    en: 'en-US',
    fr: 'fr-FR',
    es: 'es-ES',
    zh: 'zh-CN',
  }

  return date.toLocaleDateString(localeMap[locale.value] || 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Format execution time
function formatExecutionTime(ms: number) {
  if (!ms || ms === 0) return null
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  const mins = Math.floor(ms / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  return `${mins}m ${secs}s`
}

// Get job status icon
function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return CheckCircle
    case 'failed':
      return XCircle
    case 'processing':
      return Loader2
    case 'pending':
      return Clock
    default:
      return AlertCircle
  }
}

// Get job status color
function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'text-green-400'
    case 'failed':
      return 'text-red-400'
    case 'processing':
      return 'text-blue-400'
    case 'pending':
      return 'text-yellow-400'
    case 'risky':
      return 'text-yellow-400'
    default:
      return 'text-gray-400'
  }
}

// Get status badge variant
function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'completed':
      return 'success'
    case 'failed':
      return 'destructive'
    case 'processing':
      return 'default'
    case 'pending':
      return 'warning'
    default:
      return 'secondary'
  }
}

// View job details
function viewJob(jobId: string) {
  router.push(`/jobs/${jobId}`)
}

// View validation details
function viewValidation(validationId: string) {
  router.push(`/validations/${validationId}`)
}

// Handle item click
function handleItemClick(item: any) {
  if (item.type === 'job') {
    viewJob(item.id)
  } else {
    viewValidation(item._id)
  }
}

// Download results
async function download(jobId: string) {
  const result = await downloadResults(jobId)
  if (!result.success) {
    error.value = result.error || t('history.messages.downloadError')
  }
}

function formatJobLabel(jobId: string) {
  return t('bulk.jobs.jobLabel', { id: jobId.slice(-8) })
}

function formatCredits(count: number) {
  const value = count || 0
  const key = value === 1 ? 'history.labels.creditSingular' : 'history.labels.creditPlural'
  return t(key, { count: value })
}

// Load on mount
onMounted(() => {
  fetchHistory()
})
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="mb-8 flex flex-col gap-3">
      <UiBackButton />
      <div>
        <h1 class="text-3xl font-bold text-white mb-2">{{ t('history.hero.title') }}</h1>
        <p class="text-gray-400">{{ t('history.hero.subtitle') }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="w-12 h-12 text-blue-400 animate-spin" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center"
    >
      <p class="text-red-400">{{ error }}</p>
      <UiButton @click="fetchHistory" variant="destructive" size="sm" class="mt-4">
        {{ t('history.actions.retry') }}
      </UiButton>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!history.length"
      class="bg-zinc-900 border border-gray-800 rounded-lg p-12 text-center"
    >
      <FileText class="w-16 h-16 text-gray-600 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-white mb-2">{{ t('history.empty.title') }}</h3>
      <p class="text-gray-400 mb-6">{{ t('history.empty.description') }}</p>
      <NuxtLink to="/">
        <UiButton variant="default" size="lg"> {{ t('dashboard.validate.button') }} </UiButton>
      </NuxtLink>
    </div>

    <!-- History List -->
    <div v-else class="space-y-4">
      <div
        v-for="item in history"
        :key="item.type === 'job' ? item.id : item._id"
        class="bg-zinc-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors cursor-pointer"
        @click="handleItemClick(item)"
      >
        <!-- Individual Validation -->
        <div v-if="item.type === 'validation'">
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-4 flex-1">
              <div class="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Mail class="w-6 h-6 text-blue-400" />
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <UiBadge variant="secondary" class="text-xs">
                    {{ t('history.items.single.badge') }}
                  </UiBadge>
                  <span class="text-xs text-gray-600">·</span>
                  <span class="text-xs text-gray-500">{{ formatCredits(item.creditsUsed || 1) }}</span>
                  <template v-if="formatExecutionTime(item.executionTime)">
                    <span class="text-xs text-gray-600">·</span>
                    <span class="text-xs text-gray-500">{{
                      formatExecutionTime(item.executionTime)
                    }}</span>
                  </template>
                </div>
                <p class="text-base font-medium text-white font-mono mb-1">{{ item.email }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(item.createdAt) }}</p>
              </div>
            </div>
            <div class="flex flex-col items-end gap-2">
              <div class="flex items-center gap-2">
                <component
                  :is="getStatusIcon(item.status)"
                  :class="['w-5 h-5', getStatusColor(item.status)]"
                />
                <UiBadge :variant="getStatusBadgeVariant(item.status)">
                  {{ validationStatusLabels[item.status] || item.status }}
                </UiBadge>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-400">{{ t('history.labels.riskScore') }}</span>
                <span
                  :class="[
                    'text-lg font-bold',
                    item.riskScore >= 70
                      ? 'text-red-400'
                      : item.riskScore >= 40
                        ? 'text-yellow-400'
                        : 'text-green-400',
                  ]"
                >
                  {{ item.riskScore }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bulk Job -->
        <div v-else>
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-start gap-4">
              <div class="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <Layers class="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <UiBadge variant="secondary" class="text-xs">
                    {{ t('history.items.bulk.badge') }}
                  </UiBadge>
                  <span class="text-xs text-gray-600">·</span>
                  <span class="text-xs text-gray-500">{{ formatCredits(item.counts.total) }}</span>
                  <template v-if="formatExecutionTime(item.executionTime)">
                    <span class="text-xs text-gray-600">·</span>
                    <span class="text-xs text-gray-500">{{
                      formatExecutionTime(item.executionTime)
                    }}</span>
                  </template>
                </div>
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-semibold text-white">{{ formatJobLabel(item.id) }}</h3>
                  <component
                    :is="getStatusIcon(item.status)"
                    :class="[
                      'w-5 h-5 flex-shrink-0',
                      getStatusColor(item.status),
                      item.status === 'processing' ? 'animate-spin' : '',
                    ]"
                  />
                  <UiBadge :variant="getStatusBadgeVariant(item.status)">
                    {{ jobStatusLabels[item.status] || item.status }}
                  </UiBadge>
                </div>
                <p class="text-sm text-gray-400 mt-1">{{ formatDate(item.createdAt) }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <UiButton
                variant="outline"
                size="sm"
                class="border-gray-700 text-gray-300 hover:bg-zinc-800"
                @click.stop="viewJob(item.id)"
              >
                <Eye class="w-4 h-4 mr-2" />
                {{ t('history.actions.view') }}
              </UiButton>
              <UiButton
                v-if="item.status === 'completed' && item.hasResults"
                variant="outline"
                size="sm"
                class="border-green-700 text-green-400 hover:bg-green-950/50"
                @click.stop="download(item.id)"
              >
                <Download class="w-4 h-4 mr-2" />
                {{ t('history.actions.download') }}
              </UiButton>
            </div>
          </div>

          <!-- Progress Bar -->
          <div v-if="item.status === 'processing' || item.status === 'completed'" class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-400">{{ t('bulk.jobs.progress') }}</span>
              <span class="text-sm font-semibold text-white">{{ item.progress }}%</span>
            </div>
            <div class="w-full bg-gray-800 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: item.progress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Counts -->
          <div v-if="item.counts.total > 0" class="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div class="p-3 bg-black border border-gray-800 rounded-md">
              <div class="text-xs text-gray-400 mb-1">{{ t('bulk.counts.total') }}</div>
              <div class="text-xl font-bold text-white">{{ item.counts.total }}</div>
            </div>
            <div class="p-3 bg-black border border-gray-800 rounded-md">
              <div class="text-xs text-gray-400 mb-1">{{ t('bulk.counts.valid') }}</div>
              <div class="text-xl font-bold text-green-400">{{ item.counts.valid }}</div>
            </div>
            <div class="p-3 bg-black border border-gray-800 rounded-md">
              <div class="text-xs text-gray-400 mb-1">{{ t('bulk.counts.invalid') }}</div>
              <div class="text-xl font-bold text-red-400">{{ item.counts.invalid }}</div>
            </div>
            <div class="p-3 bg-black border border-gray-800 rounded-md">
              <div class="text-xs text-gray-400 mb-1">{{ t('bulk.counts.risky') }}</div>
              <div class="text-xl font-bold text-yellow-400">{{ item.counts.risky }}</div>
            </div>
            <div class="p-3 bg-black border border-gray-800 rounded-md">
              <div class="text-xs text-gray-400 mb-1">{{ t('bulk.counts.unknown') }}</div>
              <div class="text-xl font-bold text-gray-400">{{ item.counts.unknown }}</div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="item.error" class="mt-4 p-3 bg-red-950/50 border border-red-800 rounded-md">
            <p class="text-sm text-red-400">{{ item.error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
