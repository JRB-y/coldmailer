<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  Loader2,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Coins,
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  ssr: false,
})

const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl
const { t, locale } = useI18n()
const localePath = useLocalePath()

const payments = ref<any[]>([])
const loading = ref(true)
const refreshing = ref(false)
const error = ref('')

const statusMap = computed(() => ({
  pending: {
    icon: Clock,
    variant: 'warning',
    color: 'text-yellow-400',
  },
  confirmed: {
    icon: CheckCircle,
    variant: 'success',
    color: 'text-green-400',
  },
  failed: {
    icon: XCircle,
    variant: 'destructive',
    color: 'text-red-400',
  },
  expired: {
    icon: AlertCircle,
    variant: 'secondary',
    color: 'text-gray-400',
  },
  cancelled: {
    icon: AlertCircle,
    variant: 'secondary',
    color: 'text-gray-400',
  },
}))

function getStatusConfig(status: string) {
  const map = statusMap.value
  return map[status] || map.pending
}

function formatAmount(amount: number | null | undefined, currency: string | null | undefined) {
  if (!amount) {
    return t('payments.labels.amountPending')
  }

  const code = currency || 'USD'

  try {
    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch (err) {
    return `${amount.toFixed(2)} ${code}`
  }
}

function formatDate(date: string | null | undefined) {
  if (!date) {
    return t('payments.labels.notAvailable')
  }

  const localeMap: Record<string, string> = {
    en: 'en-US',
    fr: 'fr-FR',
    es: 'es-ES',
    zh: 'zh-CN',
  }

  return new Date(date).toLocaleString(localeMap[locale.value] || 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function fetchPayments(manual = false) {
  if (manual) {
    refreshing.value = true
  } else {
    loading.value = true
  }

  error.value = ''

  try {
    const authToken = localStorage.getItem('auth-token')
    if (!authToken) {
      throw new Error(t('payments.messages.loadError'))
    }

    const response = await fetch(`${apiUrl}/api/payment`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || t('payments.messages.loadError'))
    }

    payments.value = data.payments || []
  } catch (err: any) {
    error.value = err.message || t('payments.messages.loadError')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

onMounted(() => {
  fetchPayments()
})
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="flex-1">
        <UiBackButton />
        <div class="mt-4">
          <h1 class="text-3xl font-bold text-white mb-2">{{ t('payments.hero.title') }}</h1>
          <p class="text-gray-400">{{ t('payments.hero.subtitle') }}</p>
        </div>
      </div>
      <UiButton
        variant="outline"
        size="sm"
        class="border-gray-700 text-gray-300 hover:bg-zinc-800 w-fit"
        :disabled="refreshing"
        @click="() => fetchPayments(true)"
      >
        <RefreshCw :class="['w-4 h-4', refreshing ? 'animate-spin' : '']" />
        <span class="ml-2">{{ t('payments.actions.refresh') }}</span>
      </UiButton>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="w-12 h-12 text-blue-400 animate-spin" />
    </div>

    <div
      v-else-if="error"
      class="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center"
    >
      <p class="text-red-400">{{ error }}</p>
      <UiButton @click="() => fetchPayments(true)" variant="destructive" size="sm" class="mt-4">
        {{ t('payments.actions.refresh') }}
      </UiButton>
    </div>

    <div
      v-else-if="payments.length === 0"
      class="bg-zinc-900 border border-gray-800 rounded-lg p-12 text-center"
    >
      <Coins class="w-16 h-16 text-gray-600 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-white mb-2">{{ t('payments.empty.title') }}</h3>
      <p class="text-gray-400 mb-6">{{ t('payments.empty.description') }}</p>
      <NuxtLink :to="localePath('/pricing')">
        <UiButton size="lg">{{ t('header.menu.buyCredits') }}</UiButton>
      </NuxtLink>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="payment in payments"
        :key="payment.id"
        class="bg-zinc-900 border border-gray-800 rounded-lg p-6 md:p-8"
      >
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h2 class="text-xl font-semibold text-white">
                {{ payment.planName || payment.plan?.name || t('payments.labels.unknownPlan') }}
              </h2>
              <UiBadge :variant="getStatusConfig(payment.status).variant" class="text-xs">
                {{ t(`payments.status.${payment.status}`) }}
              </UiBadge>
            </div>
            <p class="text-sm text-gray-400">
              {{ t('payments.fields.chargeCode') }}: {{ payment.coinbaseChargeCode }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <p class="text-sm text-gray-400">{{ t('payments.fields.amount') }}</p>
              <p class="text-lg font-semibold text-white">
                {{ formatAmount(payment.amount, payment.currency) }}
              </p>
            </div>
            <component
              :is="getStatusConfig(payment.status).icon"
              :class="['w-7 h-7', getStatusConfig(payment.status).color]"
            />
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2 text-sm text-gray-300">
            <div class="flex items-center justify-between">
              <span>{{ t('payments.fields.credits') }}</span>
              <span class="text-white font-semibold">
                {{ Intl.NumberFormat(locale).format(payment.credits || 0) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span>{{ t('payments.fields.created') }}</span>
              <span>{{ formatDate(payment.createdAt) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>{{ t('payments.fields.confirmed') }}</span>
              <span>
                {{
                  payment.confirmedAt
                    ? formatDate(payment.confirmedAt)
                    : t('payments.labels.notConfirmed')
                }}
              </span>
            </div>
          </div>

          <div class="space-y-3 text-sm text-gray-300">
            <div class="flex items-center justify-between">
              <span>{{ t('payments.fields.status') }}</span>
              <span class="font-medium text-white">
                {{ t(`payments.status.${payment.status}`) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span>{{ t('payments.fields.chargeId') }}</span>
              <span class="text-gray-400">{{ payment.coinbaseChargeId }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>{{ t('payments.fields.hostedUrl') }}</span>
              <span>
                <a
                  v-if="payment.hostedUrl"
                  :href="payment.hostedUrl"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink class="w-4 h-4" />
                  {{ t('payments.labels.viewLink') }}
                </a>
                <span v-else class="text-gray-500">{{ t('payments.labels.noLink') }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
