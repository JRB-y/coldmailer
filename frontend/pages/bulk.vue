<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Download,
  Loader2,
  RefreshCw,
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  ssr: false,
})

const { uploadCSV, getJobs, downloadResults } = useBulk()
const { user, fetchUser } = useAuth()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref('')
const jobs = ref<any[]>([])
const loading = ref(false)
const polling = ref(false)
const previousJobStatuses = ref<Map<string, string>>(new Map())
let pollInterval: any = null

const { t, locale } = useI18n()

const statusLabels = computed(() => ({
  completed: t('bulk.jobs.status.completed'),
  failed: t('bulk.jobs.status.failed'),
  processing: t('bulk.jobs.status.processing'),
  pending: t('bulk.jobs.status.pending'),
}))

// Separate active and completed jobs
const activeJobs = computed(() =>
  jobs.value.filter((job) => job.status === 'pending' || job.status === 'processing')
)

const completedJobs = computed(
  () =>
    jobs.value.filter((job) => job.status === 'completed' || job.status === 'failed').slice(0, 10) // Show only last 10 completed jobs
)

// File selection
function onFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    uploadError.value = ''
    uploadSuccess.value = ''
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

function clearFile() {
  selectedFile.value = null
  uploadError.value = ''
  uploadSuccess.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Upload file
async function uploadFile() {
  if (!selectedFile.value) {
    uploadError.value = t('bulk.upload.messages.selectFile')
    return
  }

  uploading.value = true
  uploadError.value = ''
  uploadSuccess.value = ''

  const result = await uploadCSV(selectedFile.value)

  uploading.value = false

  if (result.success) {
    const emailCount = result.data?.emailCount || 0
    const creditsRequired = result.data?.creditsRequired || 0
    uploadSuccess.value = t('bulk.upload.messages.success', {
      emailCount,
      creditsRequired,
    })
    clearFile()

    // Refresh user credits immediately after successful upload
    await fetchUser()
    await fetchJobs(true)
    startPolling()
  } else {
    uploadError.value = result.error || t('bulk.upload.messages.error')
  }
}

// Fetch all jobs (including completed ones for download)
async function fetchJobs(refreshCredits = false) {
  loading.value = true
  const result = await getJobs() // Fetch all jobs, not just pending/processing
  loading.value = false

  if (result.success) {
    const newJobs = result.jobs || []

    // Check if any jobs completed since last fetch
    let shouldRefreshCredits = refreshCredits
    for (const job of newJobs) {
      const previousStatus = previousJobStatuses.value.get(job.id)
      const currentStatus = job.status

      // If job transitioned to completed or failed, refresh credits
      if (
        previousStatus &&
        (previousStatus === 'pending' || previousStatus === 'processing') &&
        (currentStatus === 'completed' || currentStatus === 'failed')
      ) {
        shouldRefreshCredits = true
      }

      // Update status tracking
      previousJobStatuses.value.set(job.id, currentStatus)
    }

    jobs.value = newJobs

    // Refresh user credits if any job completed or if forced
    if (shouldRefreshCredits) {
      await fetchUser()
    }
  }
}

// Download results
async function download(jobId: string) {
  const result = await downloadResults(jobId)
  if (!result.success) {
    alert(result.error || t('bulk.messages.downloadError'))
  }
}

// Status helpers
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
    default:
      return 'text-gray-400'
  }
}

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

// Format date
function formatDate(date: string) {
  return new Date(date).toLocaleString()
}

function formatJobLabel(jobId: string) {
  return t('bulk.jobs.jobLabel', { id: jobId.slice(-8) })
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

// Format file size
function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// Polling for active jobs
function startPolling() {
  if (polling.value) return

  polling.value = true
  pollInterval = setInterval(async () => {
    if (activeJobs.value.length > 0) {
      await fetchJobs(true)
    } else {
      stopPolling()
    }
  }, 3000) // Poll every 3 seconds
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
    polling.value = false
  }
}

// Check if there are active jobs on mount
onMounted(async () => {
  await fetchJobs()

  if (activeJobs.value.length > 0) {
    startPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="mb-6 flex flex-col gap-2">
      <UiBackButton />
      <div>
        <h1 class="text-2xl font-bold text-white mb-1">{{ t('bulk.hero.title') }}</h1>
        <p class="text-sm text-gray-400">
          {{ t('bulk.hero.subtitle') }}
        </p>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-4">
      <!-- Upload Section -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Upload Card -->
        <div class="bg-zinc-900/50 border border-gray-800/50 rounded-lg p-5">
          <div class="flex items-center gap-2 mb-4">
            <Upload class="w-4 h-4 text-gray-400" />
            <h2 class="text-base font-semibold text-white">
              {{ t('bulk.upload.title') }}
            </h2>
          </div>

          <!-- File Input Area -->
          <div
            class="border border-dashed border-gray-700/60 rounded-lg p-6 text-center hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer group"
            @click="triggerFileInput"
          >
            <Upload
              class="w-10 h-10 text-gray-600 group-hover:text-blue-500/60 mx-auto mb-3 transition-colors"
            />
            <p class="text-sm text-gray-300 mb-1">
              {{ selectedFile ? selectedFile.name : t('bulk.upload.drop.placeholder') }}
            </p>
            <p class="text-xs text-gray-500">
              {{
                selectedFile ? `${formatFileSize(selectedFile.size)}` : t('bulk.upload.drop.helper')
              }}
            </p>
            <input
              ref="fileInput"
              type="file"
              accept=".csv"
              class="hidden"
              @change="onFileSelect"
            />
          </div>

          <!-- Upload Actions -->
          <div class="mt-4 flex flex-col sm:flex-row gap-2">
            <UiButton
              :disabled="!selectedFile || uploading"
              size="sm"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-9"
              @click="uploadFile"
            >
              <Upload v-if="!uploading" class="w-3.5 h-3.5 mr-1.5" />
              <Loader2 v-else class="w-3.5 h-3.5 mr-1.5 animate-spin" />
              {{ uploading ? t('bulk.upload.actions.uploading') : t('bulk.upload.actions.submit') }}
            </UiButton>

            <UiButton
              v-if="selectedFile"
              variant="outline"
              size="sm"
              class="border-gray-700/60 text-gray-300 hover:bg-zinc-800/50 h-9"
              @click="clearFile"
            >
              {{ t('bulk.upload.actions.clear') }}
            </UiButton>
          </div>

          <!-- Upload Messages -->
          <div
            v-if="uploadError"
            class="mt-3 p-3 bg-red-950/30 border border-red-800/40 rounded-md flex items-start gap-2"
          >
            <XCircle class="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p class="text-xs text-red-400">{{ uploadError }}</p>
          </div>

          <div
            v-if="uploadSuccess"
            class="mt-3 p-3 bg-green-950/30 border border-green-800/40 rounded-md flex items-start gap-2"
          >
            <CheckCircle class="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <p class="text-xs text-green-400">{{ uploadSuccess }}</p>
          </div>

          <!-- CSV Format Info -->
          <div class="mt-4 p-3 bg-black/40 border border-gray-800/40 rounded-md">
            <div class="flex items-center gap-2 mb-2">
              <FileText class="w-3.5 h-3.5 text-gray-400" />
              <h3 class="text-xs font-semibold text-white">
                {{ t('bulk.upload.format.title') }}
              </h3>
            </div>
            <p class="text-xs text-gray-400 mb-2">
              {{ t('bulk.upload.format.description') }}
            </p>
            <div
              class="bg-zinc-900/60 p-2.5 rounded text-xs font-mono text-gray-300 border border-gray-800/40"
            >
              email<br />
              john@example.com<br />
              jane@example.com
            </div>
          </div>
        </div>

        <!-- Jobs List -->
        <div class="bg-zinc-900/50 border border-gray-800/50 rounded-lg p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <Clock class="w-4 h-4 text-gray-400" />
              <h2 class="text-base font-semibold text-white">
                {{ t('bulk.jobs.active.title') }}
              </h2>
            </div>
            <button
              class="p-1.5 rounded-md hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
              @click="() => fetchJobs(true)"
              :disabled="loading"
            >
              <RefreshCw :class="['w-3.5 h-3.5 text-gray-400', loading ? 'animate-spin' : '']" />
            </button>
          </div>

          <!-- Jobs -->
          <div v-if="activeJobs.length > 0" class="space-y-3">
            <div
              v-for="job in activeJobs"
              :key="job.id"
              class="p-4 bg-black/40 border border-gray-800/40 rounded-lg"
            >
              <!-- Job Header -->
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div class="flex items-center gap-2.5">
                  <component
                    :is="getStatusIcon(job.status)"
                    :class="[
                      'w-5 h-5 flex-shrink-0',
                      getStatusColor(job.status),
                      job.status === 'processing' ? 'animate-spin' : '',
                    ]"
                  />
                  <div>
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <h3 class="text-sm font-semibold text-white">
                        {{ formatJobLabel(job.id) }}
                      </h3>
                      <UiBadge
                        :variant="getStatusBadgeVariant(job.status)"
                        class="text-[10px] px-1.5 py-0"
                      >
                        {{ statusLabels[job.status] || job.status }}
                      </UiBadge>
                      <span
                        v-if="formatExecutionTime(job.executionTime)"
                        class="text-[10px] text-gray-500"
                      >
                        · {{ formatExecutionTime(job.executionTime) }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-400 mt-0.5">
                      {{ formatDate(job.createdAt) }}
                    </p>
                  </div>
                </div>

                <UiButton
                  v-if="job.status === 'completed' && job.hasResults"
                  size="sm"
                  variant="outline"
                  class="border-green-700/60 text-green-400 hover:bg-green-950/40 w-full sm:w-auto h-8 text-xs"
                  @click="download(job.id)"
                >
                  <Download class="w-3 h-3 mr-1.5" />
                  {{ t('bulk.jobs.download') }}
                </UiButton>
              </div>

              <!-- Progress Bar -->
              <div v-if="job.status === 'processing' || job.status === 'completed'" class="mb-3">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs text-gray-400">{{ t('bulk.jobs.progress') }}</span>
                  <span class="text-xs font-semibold text-white">{{ job.progress }}%</span>
                </div>
                <div class="w-full bg-gray-800/50 rounded-full h-1.5">
                  <div
                    class="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    :style="{ width: job.progress + '%' }"
                  ></div>
                </div>
              </div>

              <!-- Counts -->
              <div v-if="job.counts.total > 0" class="grid grid-cols-5 gap-2">
                <div class="p-2 bg-zinc-900/60 border border-gray-800/40 rounded">
                  <div class="text-[10px] text-gray-400 mb-0.5">{{ t('bulk.counts.total') }}</div>
                  <div class="text-sm font-bold text-white">
                    {{ job.counts.total }}
                  </div>
                </div>
                <div class="p-2 bg-zinc-900/60 border border-green-900/30 rounded">
                  <div class="text-[10px] text-gray-400 mb-0.5">{{ t('bulk.counts.valid') }}</div>
                  <div class="text-sm font-bold text-green-400">
                    {{ job.counts.valid }}
                  </div>
                </div>
                <div class="p-2 bg-zinc-900/60 border border-red-900/30 rounded">
                  <div class="text-[10px] text-gray-400 mb-0.5">{{ t('bulk.counts.invalid') }}</div>
                  <div class="text-sm font-bold text-red-400">
                    {{ job.counts.invalid }}
                  </div>
                </div>
                <div class="p-2 bg-zinc-900/60 border border-yellow-900/30 rounded">
                  <div class="text-[10px] text-gray-400 mb-0.5">{{ t('bulk.counts.risky') }}</div>
                  <div class="text-sm font-bold text-yellow-400">
                    {{ job.counts.risky }}
                  </div>
                </div>
                <div class="p-2 bg-zinc-900/60 border border-gray-800/40 rounded">
                  <div class="text-[10px] text-gray-400 mb-0.5">{{ t('bulk.counts.unknown') }}</div>
                  <div class="text-sm font-bold text-gray-400">
                    {{ job.counts.unknown }}
                  </div>
                </div>
              </div>

              <!-- Error Message -->
              <div
                v-if="job.error"
                class="mt-3 p-2.5 bg-red-950/30 border border-red-800/40 rounded-md flex items-start gap-2"
              >
                <AlertCircle class="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <p class="text-xs text-red-400">{{ job.error }}</p>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-8">
            <FileText class="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p class="text-sm text-gray-400">{{ t('bulk.jobs.empty.title') }}</p>
            <p class="text-xs text-gray-500 mt-1">
              {{ t('bulk.jobs.empty.description') }}
            </p>
          </div>
        </div>

        <!-- Recent Completed Jobs -->
        <div
          v-if="completedJobs.length > 0"
          class="bg-zinc-900/50 border border-gray-800/50 rounded-lg p-5"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <CheckCircle class="w-4 h-4 text-gray-400" />
              <h2 class="text-base font-semibold text-white">
                {{ t('bulk.jobs.recent.title') }}
              </h2>
            </div>
            <NuxtLink
              to="/history"
              class="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              {{ t('bulk.jobs.recent.cta') }}
            </NuxtLink>
          </div>

          <div class="space-y-3">
            <div
              v-for="job in completedJobs"
              :key="job.id"
              class="p-4 bg-black/40 border border-gray-800/40 rounded-lg"
            >
              <!-- Job Header -->
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div class="flex items-center gap-2.5">
                  <component
                    :is="getStatusIcon(job.status)"
                    :class="['w-5 h-5 flex-shrink-0', getStatusColor(job.status)]"
                  />
                  <div>
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <h3 class="text-sm font-semibold text-white">
                        {{ formatJobLabel(job.id) }}
                      </h3>
                      <UiBadge
                        :variant="getStatusBadgeVariant(job.status)"
                        class="text-[10px] px-1.5 py-0"
                      >
                        {{ statusLabels[job.status] || job.status }}
                      </UiBadge>
                      <span
                        v-if="formatExecutionTime(job.executionTime)"
                        class="text-[10px] text-gray-500"
                      >
                        · {{ formatExecutionTime(job.executionTime) }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-400 mt-0.5">
                      {{ formatDate(job.createdAt) }}
                    </p>
                  </div>
                </div>
                <UiButton
                  v-if="job.status === 'completed' && job.hasResults"
                  size="sm"
                  variant="outline"
                  class="border-green-700/60 text-green-400 hover:bg-green-950/40 w-full sm:w-auto h-8 text-xs"
                  @click="download(job.id)"
                >
                  <Download class="w-3 h-3 mr-1.5" />
                  {{ t('bulk.jobs.downloadResults') }}
                </UiButton>
              </div>

              <!-- Counts -->
              <div v-if="job.counts.total > 0" class="grid grid-cols-5 gap-2">
                <div class="p-2 bg-zinc-900/60 border border-gray-800/40 rounded">
                  <div class="text-[10px] text-gray-400 mb-0.5">{{ t('bulk.counts.total') }}</div>
                  <div class="text-sm font-bold text-white">
                    {{ job.counts.total }}
                  </div>
                </div>
                <div class="p-2 bg-zinc-900/60 border border-green-900/30 rounded">
                  <div class="text-[10px] text-gray-400 mb-0.5">{{ t('bulk.counts.valid') }}</div>
                  <div class="text-sm font-bold text-green-400">
                    {{ job.counts.valid }}
                  </div>
                </div>
                <div class="p-2 bg-zinc-900/60 border border-red-900/30 rounded">
                  <div class="text-[10px] text-gray-400 mb-0.5">{{ t('bulk.counts.invalid') }}</div>
                  <div class="text-sm font-bold text-red-400">
                    {{ job.counts.invalid }}
                  </div>
                </div>
                <div class="p-2 bg-zinc-900/60 border border-yellow-900/30 rounded">
                  <div class="text-[10px] text-gray-400 mb-0.5">{{ t('bulk.counts.risky') }}</div>
                  <div class="text-sm font-bold text-yellow-400">
                    {{ job.counts.risky }}
                  </div>
                </div>
                <div class="p-2 bg-zinc-900/60 border border-gray-800/40 rounded">
                  <div class="text-[10px] text-gray-400 mb-0.5">{{ t('bulk.counts.unknown') }}</div>
                  <div class="text-sm font-bold text-gray-400">
                    {{ job.counts.unknown }}
                  </div>
                </div>
              </div>

              <!-- Error Message -->
              <div
                v-if="job.error"
                class="mt-3 p-2.5 bg-red-950/30 border border-red-800/40 rounded-md flex items-start gap-2"
              >
                <AlertCircle class="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <p class="text-xs text-red-400">{{ job.error }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <!-- Credits Info -->
        <div class="bg-zinc-900/50 border border-gray-800/50 rounded-lg p-5">
          <div class="flex items-center gap-2 mb-4">
            <div class="p-1.5 bg-blue-500/10 rounded">
              <FileText class="w-3.5 h-3.5 text-blue-400" />
            </div>
            <h3 class="text-sm font-semibold text-white">
              {{ t('bulk.sidebar.credits.title') }}
            </h3>
          </div>
          <div class="text-center p-5 bg-black/40 border border-gray-800/40 rounded-lg">
            <div class="text-3xl font-bold text-blue-400 mb-1">
              {{ Intl.NumberFormat(locale.value).format(user?.credits || 0) }}
            </div>
            <div class="text-xs text-gray-400">{{ t('bulk.sidebar.credits.available') }}</div>
          </div>
          <div
            v-if="(user?.credits || 0) < 100"
            class="mt-3 p-2.5 bg-yellow-950/20 border border-yellow-800/30 rounded-md"
          >
            <p class="text-xs text-yellow-400 mb-1.5">
              {{ t('bulk.sidebar.credits.low') }}
            </p>
            <NuxtLink to="/pricing" class="text-xs text-blue-400 hover:text-blue-300 underline">
              {{ t('bulk.sidebar.credits.cta') }} →
            </NuxtLink>
          </div>
          <p v-else class="text-xs text-gray-500 mt-3">
            {{ t('bulk.sidebar.credits.info') }}
          </p>
        </div>

        <!-- Help Card -->
        <div class="bg-zinc-900/50 border border-gray-800/50 rounded-lg p-5">
          <div class="flex items-center gap-2 mb-4">
            <div class="p-1.5 bg-blue-500/10 rounded">
              <AlertCircle class="w-3.5 h-3.5 text-blue-400" />
            </div>
            <h3 class="text-sm font-semibold text-white">
              {{ t('bulk.steps.title') }}
            </h3>
          </div>
          <ol class="space-y-2.5 text-xs text-gray-400">
            <li class="flex gap-2.5">
              <span
                class="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold"
              >
                1
              </span>
              <span>{{ t('bulk.steps.items.upload') }}</span>
            </li>
            <li class="flex gap-2.5">
              <span
                class="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold"
              >
                2
              </span>
              <span>{{ t('bulk.steps.items.wait') }}</span>
            </li>
            <li class="flex gap-2.5">
              <span
                class="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold"
              >
                3
              </span>
              <span>{{ t('bulk.steps.items.download') }}</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>
