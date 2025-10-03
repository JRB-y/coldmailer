<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Clock,
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  ssr: false,
})

const route = useRoute()
const router = useRouter()
const { getJobValidations } = useBulk()

const jobId = route.params.id as string
const validations = ref<any[]>([])
const job = ref<any>(null)
const loading = ref(true)
const error = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const limit = 50

let pollInterval: any = null

// Fetch validations for this job
async function fetchValidations(page = 1) {
  if (page === 1) loading.value = true

  const result = await getJobValidations(jobId, page, limit)

  loading.value = false

  if (result.success) {
    validations.value = result.validations || []
    job.value = result.job || null
    currentPage.value = result.pagination?.page || 1
    totalPages.value = result.pagination?.pages || 1
  } else {
    error.value = result.error || 'Failed to load validations'
  }
}

// Start polling for real-time updates
function startPolling() {
  if (pollInterval) return

  pollInterval = setInterval(async () => {
    if (job.value?.status === 'processing' || job.value?.status === 'pending') {
      await fetchValidations(currentPage.value)
    } else {
      stopPolling()
    }
  }, 3000) // Poll every 3 seconds
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

// Format date
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
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
    case 'risky':
    case 'unknown':
      return AlertCircle
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

// Status badge variant
function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'valid':
      return 'success'
    case 'invalid':
      return 'destructive'
    case 'risky':
      return 'warning'
    default:
      return 'secondary'
  }
}

// Pagination
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    fetchValidations(page)
  }
}

const isJobActive = computed(() => {
  return job.value?.status === 'pending' || job.value?.status === 'processing'
})

onMounted(() => {
  fetchValidations()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="min-h-screen bg-black">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-white">Job {{ jobId.slice(-8) }}</h1>
            <div v-if="job" class="flex items-center gap-2 mt-2">
              <p class="text-sm text-gray-400">{{ job.counts.total }} total emails</p>
              <span class="text-xs text-gray-700">·</span>
              <p class="text-xs text-gray-500">{{ job.counts.total }} credits used</p>
            </div>
          </div>

          <UiButton
            variant="outline"
            size="sm"
            class="border-gray-700 text-gray-300 hover:bg-zinc-800"
            @click="() => fetchValidations(currentPage)"
            :disabled="loading"
          >
            <RefreshCw :class="['w-4 h-4', loading ? 'animate-spin' : '']" />
          </UiButton>
        </div>
      </div>

      <!-- Job Status Card -->
      <div v-if="job" class="bg-zinc-900 border border-gray-800 rounded-lg p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <Loader2 v-if="isJobActive" class="w-6 h-6 text-blue-400 animate-spin" />
            <CheckCircle v-else-if="job.status === 'completed'" class="w-6 h-6 text-green-400" />
            <XCircle v-else class="w-6 h-6 text-red-400" />

            <div>
              <h2 class="text-lg font-semibold text-white">
                {{ job.status.charAt(0).toUpperCase() + job.status.slice(1) }}
              </h2>
              <p v-if="isJobActive" class="text-sm text-gray-400">Processing emails...</p>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-4">
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
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div class="p-3 bg-black border border-gray-800 rounded-md">
            <div class="text-xs text-gray-400 mb-1">Total</div>
            <div class="text-xl font-bold text-white">{{ job.counts.total }}</div>
          </div>
          <div class="p-3 bg-black border border-gray-800 rounded-md">
            <div class="text-xs text-gray-400 mb-1">Valid</div>
            <div class="text-xl font-bold text-green-400">{{ job.counts.valid }}</div>
          </div>
          <div class="p-3 bg-black border border-gray-800 rounded-md">
            <div class="text-xs text-gray-400 mb-1">Invalid</div>
            <div class="text-xl font-bold text-red-400">{{ job.counts.invalid }}</div>
          </div>
          <div class="p-3 bg-black border border-gray-800 rounded-md">
            <div class="text-xs text-gray-400 mb-1">Risky</div>
            <div class="text-xl font-bold text-yellow-400">{{ job.counts.risky }}</div>
          </div>
          <div class="p-3 bg-black border border-gray-800 rounded-md">
            <div class="text-xs text-gray-400 mb-1">Unknown</div>
            <div class="text-xl font-bold text-gray-400">{{ job.counts.unknown }}</div>
          </div>
        </div>
      </div>

      <!-- Validations List -->
      <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
        <h2 class="text-xl font-bold text-white mb-6">Validation Results</h2>

        <!-- Loading State -->
        <div v-if="loading && validations.length === 0" class="text-center py-12">
          <Loader2 class="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
          <p class="text-gray-400">Loading validations...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <XCircle class="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p class="text-red-400">{{ error }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="validations.length === 0" class="text-center py-12">
          <Clock class="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p class="text-gray-400">No validations yet</p>
          <p class="text-sm text-gray-500 mt-2">Results will appear here as emails are validated</p>
        </div>

        <!-- Validations Table -->
        <div v-else>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-800">
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-400">Email</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-400">Status</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                    Risk Score
                  </th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-400">Reason</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-400">Time</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="validation in validations"
                  :key="validation._id"
                  class="border-b border-gray-800 hover:bg-zinc-800/50 cursor-pointer"
                  @click="router.push(`/validations/${validation._id}`)"
                >
                  <td class="py-3 px-4 text-sm text-gray-300 font-mono">
                    {{ validation.email }}
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <component
                        :is="getStatusIcon(validation.status)"
                        :class="['w-4 h-4', getStatusColor(validation.status)]"
                      />
                      <UiBadge :variant="getStatusBadgeVariant(validation.status)" class="text-xs">
                        {{ validation.status }}
                      </UiBadge>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <span
                      :class="[
                        'text-sm font-semibold',
                        validation.riskScore >= 70
                          ? 'text-red-400'
                          : validation.riskScore >= 40
                            ? 'text-yellow-400'
                            : 'text-green-400',
                      ]"
                    >
                      {{ validation.riskScore }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-sm text-gray-400 max-w-xs truncate">
                    {{ validation.reason || '-' }}
                  </td>
                  <td class="py-3 px-4 text-xs text-gray-500">
                    {{ formatDate(validation.createdAt) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-between mt-6">
            <p class="text-sm text-gray-400">Page {{ currentPage }} of {{ totalPages }}</p>
            <div class="flex items-center gap-2">
              <UiButton
                variant="outline"
                size="sm"
                :disabled="currentPage === 1"
                @click="goToPage(currentPage - 1)"
                class="text-gray-300 hover:bg-zinc-800 bg-transparent border-gray-700"
              >
                Previous
              </UiButton>
              <UiButton
                variant="outline"
                size="sm"
                :disabled="currentPage === totalPages"
                @click="goToPage(currentPage + 1)"
                class="border-gray-700 text-gray-300 hover:bg-zinc-800 bg-black"
              >
                Next
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
