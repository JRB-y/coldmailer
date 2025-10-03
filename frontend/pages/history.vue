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
      throw new Error('Failed to load history')
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
    error.value = err.message || 'Failed to load history'
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

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
    error.value = result.error || 'Download failed'
  }
}

// Load on mount
onMounted(() => {
  fetchHistory()
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
        <div class="mb-8 flex flex-col gap-3">
          <UiBackButton />
          <div>
            <h1 class="text-3xl font-bold text-white mb-2">Validation History</h1>
            <p class="text-gray-400">View all your validations and jobs</p>
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
            Retry
          </UiButton>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!history.length"
          class="bg-zinc-900 border border-gray-800 rounded-lg p-12 text-center"
        >
          <FileText class="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-white mb-2">No history yet</h3>
          <p class="text-gray-400 mb-6">Start validating emails to see your history here</p>
          <NuxtLink to="/">
            <UiButton variant="default" size="lg">
              Validate Email
            </UiButton>
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
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 flex-1">
                  <Mail class="w-5 h-5 text-gray-500" />
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-medium text-white font-mono">{{ item.email }}</p>
                      <span class="text-xs text-gray-600">·</span>
                      <span class="text-xs text-gray-500">{{ item.creditsUsed || 1 }} credit</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">{{ formatDate(item.createdAt) }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <component
                    :is="getStatusIcon(item.status)"
                    :class="['w-5 h-5', getStatusColor(item.status)]"
                  />
                  <UiBadge :variant="getStatusBadgeVariant(item.status)">
                    {{ item.status }}
                  </UiBadge>
                  <span
                    :class="[
                      'text-sm font-semibold',
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

            <!-- Bulk Job -->
            <div v-else>
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <component
                    :is="getStatusIcon(item.status)"
                    :class="[
                      'w-8 h-8 flex-shrink-0',
                      getStatusColor(item.status),
                      item.status === 'processing' ? 'animate-spin' : '',
                    ]"
                  />
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-lg font-semibold text-white">
                        Job {{ item.id.slice(-8) }}
                      </h3>
                      <UiBadge :variant="getStatusBadgeVariant(item.status)">
                        {{ item.status.charAt(0).toUpperCase() + item.status.slice(1) }}
                      </UiBadge>
                      <span class="text-xs text-gray-600">·</span>
                      <span class="text-xs text-gray-500">{{ item.counts.total }} credits</span>
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
                    View
                  </UiButton>
                  <UiButton
                    v-if="item.status === 'completed' && item.hasResults"
                    variant="outline"
                    size="sm"
                    class="border-green-700 text-green-400 hover:bg-green-950/50"
                    @click.stop="download(item.id)"
                  >
                    <Download class="w-4 h-4 mr-2" />
                    Download
                  </UiButton>
                </div>
              </div>

              <!-- Progress Bar -->
              <div
                v-if="item.status === 'processing' || item.status === 'completed'"
                class="mb-4"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-gray-400">Progress</span>
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
                  <div class="text-xs text-gray-400 mb-1">Total</div>
                  <div class="text-xl font-bold text-white">{{ item.counts.total }}</div>
                </div>
                <div class="p-3 bg-black border border-gray-800 rounded-md">
                  <div class="text-xs text-gray-400 mb-1">Valid</div>
                  <div class="text-xl font-bold text-green-400">{{ item.counts.valid }}</div>
                </div>
                <div class="p-3 bg-black border border-gray-800 rounded-md">
                  <div class="text-xs text-gray-400 mb-1">Invalid</div>
                  <div class="text-xl font-bold text-red-400">{{ item.counts.invalid }}</div>
                </div>
                <div class="p-3 bg-black border border-gray-800 rounded-md">
                  <div class="text-xs text-gray-400 mb-1">Risky</div>
                  <div class="text-xl font-bold text-yellow-400">{{ item.counts.risky }}</div>
                </div>
                <div class="p-3 bg-black border border-gray-800 rounded-md">
                  <div class="text-xs text-gray-400 mb-1">Unknown</div>
                  <div class="text-xl font-bold text-gray-400">{{ item.counts.unknown }}</div>
                </div>
              </div>

              <!-- Error Message -->
              <div
                v-if="item.error"
                class="mt-4 p-3 bg-red-950/50 border border-red-800 rounded-md"
              >
                <p class="text-sm text-red-400">{{ item.error }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <UiFooter />
  </div>
</template>
