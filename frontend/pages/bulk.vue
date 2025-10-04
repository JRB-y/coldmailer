<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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
    uploadError.value = 'Please select a CSV file'
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
    uploadSuccess.value = `✓ File uploaded successfully! Processing ${emailCount} emails (${creditsRequired} credits will be used)`
    clearFile()

    // Refresh user credits immediately after successful upload
    await fetchUser()
    await fetchJobs(true)
    startPolling()
  } else {
    uploadError.value = result.error || 'Upload failed'
  }
}

// Fetch running jobs only (pending, processing)
async function fetchJobs(refreshCredits = false) {
  loading.value = true
  const result = await getJobs('pending,processing')
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
    alert(result.error || 'Download failed')
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
    const hasActiveJobs = jobs.value.some(
      (job) => job.status === 'pending' || job.status === 'processing'
    )

    if (hasActiveJobs) {
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

  const hasActiveJobs = jobs.value.some(
    (job) => job.status === 'pending' || job.status === 'processing'
  )

  if (hasActiveJobs) {
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
    <div class="mb-6 md:mb-8 flex flex-col gap-3">
      <UiBackButton />
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">Bulk Email Validation</h1>
        <p class="text-sm md:text-base text-gray-400">
          Upload a CSV file to validate multiple emails at once
        </p>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6 md:gap-8">
      <!-- Upload Section -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Upload Card -->
        <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6 md:p-8">
          <h2 class="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Upload CSV File</h2>

          <!-- File Input Area -->
          <div
            class="border-2 border-dashed border-gray-700 rounded-lg p-8 md:p-12 text-center hover:border-blue-500/50 transition-colors cursor-pointer"
            @click="triggerFileInput"
          >
            <Upload class="w-12 h-12 md:w-16 md:h-16 text-gray-500 mx-auto mb-4" />
            <p class="text-base md:text-lg text-gray-300 mb-2">
              {{ selectedFile ? selectedFile.name : 'Click to upload or drag and drop' }}
            </p>
            <p class="text-xs md:text-sm text-gray-500">
              {{
                selectedFile ? `${formatFileSize(selectedFile.size)}` : 'CSV files only (max 10MB)'
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
          <div class="mt-6 flex flex-col sm:flex-row gap-3">
            <UiButton
              :disabled="!selectedFile || uploading"
              size="lg"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              @click="uploadFile"
            >
              <Upload v-if="!uploading" class="w-4 h-4 mr-2" />
              <Loader2 v-else class="w-4 h-4 mr-2 animate-spin" />
              {{ uploading ? 'Uploading...' : 'Upload & Validate' }}
            </UiButton>

            <UiButton
              v-if="selectedFile"
              variant="outline"
              size="lg"
              class="border-gray-700 text-gray-300 hover:bg-zinc-800 bg-white/5"
              @click="clearFile"
            >
              Clear
            </UiButton>
          </div>

          <!-- Upload Messages -->
          <div v-if="uploadError" class="mt-4 p-4 bg-red-950/50 border border-red-800 rounded-md">
            <p class="text-sm text-red-400">{{ uploadError }}</p>
          </div>

          <div
            v-if="uploadSuccess"
            class="mt-4 p-4 bg-green-950/50 border border-green-800 rounded-md"
          >
            <p class="text-sm text-green-400">{{ uploadSuccess }}</p>
          </div>

          <!-- CSV Format Info -->
          <div class="mt-6 p-4 bg-black border border-gray-800 rounded-lg">
            <h3 class="text-sm font-semibold text-white mb-2">CSV Format</h3>
            <p class="text-xs text-gray-400 mb-2">
              Your CSV should have an "email" column or a single column with email addresses:
            </p>
            <div class="bg-zinc-900 p-3 rounded text-xs font-mono text-gray-300">
              email<br />
              john@example.com<br />
              jane@example.com
            </div>
          </div>
        </div>

        <!-- Jobs List -->
        <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6 md:p-8">
          <div class="flex items-center justify-between mb-4 md:mb-6">
            <h2 class="text-lg md:text-xl font-bold text-white">Active Jobs</h2>
            <UiButton
              variant="outline"
              size="sm"
              class="border-gray-700 text-gray-300 hover:bg-zinc-800"
              @click="() => fetchJobs(true)"
              :disabled="loading"
            >
              <RefreshCw :class="['w-4 h-4', loading ? 'animate-spin' : '']" />
            </UiButton>
          </div>

          <!-- Jobs -->
          <div v-if="jobs.length > 0" class="space-y-4">
            <div
              v-for="job in jobs"
              :key="job.id"
              class="p-4 md:p-6 bg-black border border-gray-800 rounded-lg"
            >
              <!-- Job Header -->
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div class="flex items-center gap-3">
                  <component
                    :is="getStatusIcon(job.status)"
                    :class="[
                      'w-8 h-8 flex-shrink-0',
                      getStatusColor(job.status),
                      job.status === 'processing' ? 'animate-spin' : '',
                    ]"
                  />
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <h3 class="text-base md:text-lg font-semibold text-white">
                        Job {{ job.id.slice(-8) }}
                      </h3>
                      <UiBadge :variant="getStatusBadgeVariant(job.status)" class="text-xs">
                        {{ job.status.charAt(0).toUpperCase() + job.status.slice(1) }}
                      </UiBadge>
                      <span
                        v-if="formatExecutionTime(job.executionTime)"
                        class="text-xs text-gray-500"
                      >
                        · {{ formatExecutionTime(job.executionTime) }}
                      </span>
                    </div>
                    <p class="text-xs md:text-sm text-gray-400 mt-1">
                      {{ formatDate(job.createdAt) }}
                    </p>
                  </div>
                </div>

                <UiButton
                  v-if="job.status === 'completed' && job.hasResults"
                  size="sm"
                  variant="outline"
                  class="border-green-700 text-green-400 hover:bg-green-950/50 w-full sm:w-auto"
                  @click="download(job.id)"
                >
                  <Download class="w-4 h-4 mr-2" />
                  Download
                </UiButton>
              </div>

              <!-- Progress Bar -->
              <div v-if="job.status === 'processing' || job.status === 'completed'" class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-gray-400">Progress</span>
                  <span class="text-sm font-semibold text-white">{{ job.progress }}%</span>
                </div>
                <div class="w-full bg-gray-800 rounded-full h-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: job.progress + '%' }"
                  ></div>
                </div>
              </div>

              <!-- Counts -->
              <div
                v-if="job.counts.total > 0"
                class="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4"
              >
                <div class="p-3 bg-zinc-900 border border-gray-800 rounded-md">
                  <div class="text-xs text-gray-400 mb-1">Total</div>
                  <div class="text-lg md:text-xl font-bold text-white">
                    {{ job.counts.total }}
                  </div>
                </div>
                <div class="p-3 bg-zinc-900 border border-gray-800 rounded-md">
                  <div class="text-xs text-gray-400 mb-1">Valid</div>
                  <div class="text-lg md:text-xl font-bold text-green-400">
                    {{ job.counts.valid }}
                  </div>
                </div>
                <div class="p-3 bg-zinc-900 border border-gray-800 rounded-md">
                  <div class="text-xs text-gray-400 mb-1">Invalid</div>
                  <div class="text-lg md:text-xl font-bold text-red-400">
                    {{ job.counts.invalid }}
                  </div>
                </div>
                <div class="p-3 bg-zinc-900 border border-gray-800 rounded-md">
                  <div class="text-xs text-gray-400 mb-1">Risky</div>
                  <div class="text-lg md:text-xl font-bold text-yellow-400">
                    {{ job.counts.risky }}
                  </div>
                </div>
                <div class="p-3 bg-zinc-900 border border-gray-800 rounded-md">
                  <div class="text-xs text-gray-400 mb-1">Unknown</div>
                  <div class="text-lg md:text-xl font-bold text-gray-400">
                    {{ job.counts.unknown }}
                  </div>
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="job.error" class="mt-4 p-3 bg-red-950/50 border border-red-800 rounded-md">
                <p class="text-sm text-red-400">{{ job.error }}</p>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <FileText class="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p class="text-gray-400">No active jobs</p>
            <p class="text-sm text-gray-500 mt-2">Upload a CSV file to start validation</p>
            <p class="text-xs text-gray-600 mt-4">View completed jobs in the History page</p>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Credits Info -->
        <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Credits</h3>
          <div class="text-center p-6 bg-black border border-gray-800 rounded-lg">
            <div class="text-4xl font-bold text-blue-400 mb-2">{{ user?.credits || 0 }}</div>
            <div class="text-sm text-gray-400">Available Credits</div>
          </div>
          <div
            v-if="(user?.credits || 0) < 100"
            class="mt-4 p-3 bg-yellow-950/30 border border-yellow-800/50 rounded-lg"
          >
            <p class="text-xs text-yellow-400 mb-2">⚠️ Low credits. Each email costs 1 credit.</p>
            <NuxtLink to="/pricing" class="text-xs text-blue-400 hover:text-blue-300 underline">
              Buy more credits →
            </NuxtLink>
          </div>
          <p v-else class="text-xs text-gray-500 mt-4">
            Each email validation costs 1 credit. Your file will be validated before processing.
          </p>
        </div>

        <!-- Help Card -->
        <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-white mb-4">How It Works</h3>
          <ol class="space-y-3 text-sm text-gray-400">
            <li class="flex gap-3">
              <span
                class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold"
              >
                1
              </span>
              <span>Upload your CSV file with email addresses</span>
            </li>
            <li class="flex gap-3">
              <span
                class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold"
              >
                2
              </span>
              <span>Wait for the validation to complete</span>
            </li>
            <li class="flex gap-3">
              <span
                class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold"
              >
                3
              </span>
              <span>Download the results with detailed validation data</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>
