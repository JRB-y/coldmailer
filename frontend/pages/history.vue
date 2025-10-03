<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { CheckCircle, XCircle, AlertCircle, Calendar, Mail } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  ssr: false
})

const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl

const { user, logout } = useAuth()
const router = useRouter()

const validations = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const limit = 20

// Fetch validation history
async function fetchValidations(page = 1) {
  loading.value = true
  error.value = ''

  try {
    const authToken = localStorage.getItem('auth-token')

    if (!authToken) {
      router.push('/auth/login')
      return
    }

    const response = await fetch(`${apiUrl}/api/validations?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        logout()
        router.push('/auth/login')
        throw new Error('Session expired')
      }
      throw new Error(data.error || 'Failed to fetch validations')
    }

    validations.value = data.validations
    currentPage.value = data.pagination.page
    totalPages.value = data.pagination.pages
  } catch (err: any) {
    error.value = err.message || 'Failed to load validation history'
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

// Get status icon
function getStatusIcon(status: string) {
  switch (status) {
    case 'valid': return CheckCircle
    case 'invalid': return XCircle
    case 'risky': return AlertCircle
    default: return AlertCircle
  }
}

// Get status color
function getStatusColor(status: string) {
  switch (status) {
    case 'valid': return 'text-green-400'
    case 'invalid': return 'text-red-400'
    case 'risky': return 'text-yellow-400'
    default: return 'text-gray-400'
  }
}

// Get risk badge variant
function getRiskBadgeClass(riskScore: number) {
  if (riskScore >= 60) return 'bg-red-500/10 text-red-400 border-red-500/20'
  if (riskScore >= 30) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  return 'bg-green-500/10 text-green-400 border-green-500/20'
}

// Load on mount
onMounted(() => {
  fetchValidations()
})

// Pagination
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    fetchValidations(page)
  }
}

function handleLogout() {
  logout()
  router.push('/auth/login')
}
</script>

<template>
  <div class="min-h-screen bg-black">
    <!-- Header -->
    <header class="py-6 px-4 border-b border-gray-800">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <NuxtLink to="/" class="text-2xl font-bold text-white hover:text-gray-300 transition-colors">
          ColdMailer
        </NuxtLink>

        <div v-if="user" class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-sm text-gray-400">{{ user.email }}</p>
            <p class="text-sm font-semibold text-white">
              <span class="text-blue-400">{{ user.credits }}</span> credits
            </p>
          </div>
          <button
            @click="handleLogout"
            class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="py-12 px-4">
      <div class="max-w-7xl mx-auto">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">Validation History</h1>
          <p class="text-gray-400">View all your email validation results</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <p class="text-red-400">{{ error }}</p>
          <button
            @click="fetchValidations(currentPage)"
            class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Retry
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="!validations.length" class="bg-zinc-900 border border-gray-800 rounded-lg p-12 text-center">
          <Mail class="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-white mb-2">No validations yet</h3>
          <p class="text-gray-400 mb-6">Start validating emails to see your history here</p>
          <NuxtLink
            to="/"
            class="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Validate Email
          </NuxtLink>
        </div>

        <!-- Validation Table -->
        <div v-else class="bg-zinc-900 border border-gray-800 rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-zinc-800/50 border-b border-gray-700">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Checks
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-800">
                <tr
                  v-for="validation in validations"
                  :key="validation._id"
                  class="hover:bg-zinc-800/50 transition-colors"
                >
                  <!-- Email -->
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <Mail class="w-4 h-4 text-gray-500" />
                      <span class="text-sm font-medium text-white">{{ validation.email }}</span>
                    </div>
                  </td>

                  <!-- Status -->
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <component
                        :is="getStatusIcon(validation.status)"
                        :class="['w-5 h-5', getStatusColor(validation.status)]"
                      />
                      <span :class="['text-sm font-semibold capitalize', getStatusColor(validation.status)]">
                        {{ validation.status }}
                      </span>
                    </div>
                  </td>

                  <!-- Risk Score -->
                  <td class="px-6 py-4">
                    <span
                      :class="[
                        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
                        getRiskBadgeClass(validation.riskScore)
                      ]"
                    >
                      {{ validation.riskScore }}/100
                    </span>
                  </td>

                  <!-- Quick Checks Summary -->
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-1">
                      <span
                        :class="[
                          'w-2 h-2 rounded-full',
                          validation.checks.syntax ? 'bg-green-500' : 'bg-red-500'
                        ]"
                        title="Syntax"
                      ></span>
                      <span
                        :class="[
                          'w-2 h-2 rounded-full',
                          validation.checks.dns ? 'bg-green-500' : 'bg-red-500'
                        ]"
                        title="DNS"
                      ></span>
                      <span
                        :class="[
                          'w-2 h-2 rounded-full',
                          validation.checks.mx ? 'bg-green-500' : 'bg-red-500'
                        ]"
                        title="MX"
                      ></span>
                      <span
                        :class="[
                          'w-2 h-2 rounded-full',
                          validation.checks.smtp ? 'bg-green-500' : 'bg-gray-600'
                        ]"
                        title="SMTP"
                      ></span>
                      <span
                        :class="[
                          'w-2 h-2 rounded-full',
                          !validation.checks.disposable ? 'bg-green-500' : 'bg-red-500'
                        ]"
                        title="Not Disposable"
                      ></span>
                    </div>
                  </td>

                  <!-- Date -->
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar class="w-4 h-4" />
                      {{ formatDate(validation.createdAt) }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
            <div class="text-sm text-gray-400">
              Page {{ currentPage }} of {{ totalPages }}
            </div>
            <div class="flex gap-2">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-4 py-2 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 disabled:text-gray-600 text-white rounded-md transition-colors"
              >
                Previous
              </button>
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-4 py-2 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 disabled:text-gray-600 text-white rounded-md transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
