<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Check, Zap, Loader2 } from 'lucide-vue-next'

definePageMeta({ ssr: false })

const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl
const { user, isAuthenticated, fetchUser } = useAuth()
const router = useRouter()
const { t } = useI18n()
const localePath = useLocalePath()

const plans = ref<any[]>([])
const loading = ref(false)
const purchasing = ref(false)
const selectedPlanId = ref<string | null>(null)
const showToast = ref(false)
const toastMessage = ref('')

// Fetch pricing plans
async function fetchPlans() {
  loading.value = true
  try {
    const response = await fetch(`${apiUrl}/api/pricing`)
    const data = await response.json()

    if (response.ok) {
      plans.value = data.plans || []
    }
  } catch (error) {
    console.error('Failed to fetch pricing plans:', error)
  } finally {
    loading.value = false
  }
}

// Purchase credits
async function purchasePlan(planId: string) {
  if (!isAuthenticated.value) {
    router.push(localePath('/auth/login'))
    return
  }

  selectedPlanId.value = planId
  purchasing.value = true

  try {
    const authToken = localStorage.getItem('auth-token')

    const response = await fetch(`${apiUrl}/api/credits/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ planId }),
    })

    const data = await response.json()

    if (response.ok) {
      // Show success toast
      toastMessage.value = data.message || t('pricing.messages.toastSuccess')
      showToast.value = true

      // Refresh user credits
      await fetchUser()

      // Hide toast after 5 seconds
      setTimeout(() => {
        showToast.value = false
      }, 5000)
    } else {
      alert(data.message || t('pricing.messages.purchaseFailed'))
    }
  } catch (error) {
    console.error('Purchase error:', error)
    alert(t('pricing.messages.purchaseError'))
  } finally {
    purchasing.value = false
    selectedPlanId.value = null
  }
}

onMounted(() => {
  fetchPlans()
})
</script>

<template>
  <!-- Success Toast -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="showToast"
      class="fixed top-4 right-4 z-50 bg-green-950/90 border border-green-800 rounded-lg p-4 shadow-xl backdrop-blur"
    >
      <div class="flex items-center gap-3">
        <Check class="w-5 h-5 text-green-400" />
        <p class="text-sm font-medium text-green-400">{{ toastMessage }}</p>
      </div>
    </div>
  </Transition>

  <div class="max-w-7xl mx-auto pt-10">
    <!-- Page Header -->
    <div class="text-center mb-12 md:mb-16">
      <h1 class="text-4xl md:text-6xl font-bold text-white mb-4">
        {{ t('pricing.hero.title') }}
        <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {{ t('pricing.hero.highlight') }}
        </span>
      </h1>
      <p class="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
        {{ t('pricing.hero.subtitle') }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-20">
      <Loader2 class="w-12 h-12 text-blue-400 animate-spin" />
    </div>

    <!-- Pricing Cards -->
    <div v-else class="grid md:grid-cols-3 gap-6 md:gap-8">
      <div
        v-for="plan in plans"
        :key="plan.id"
        :class="[
          'relative bg-zinc-900 border rounded-2xl p-6 md:p-8 transition-all duration-300',
          plan.popular
            ? 'border-purple-500 ring-2 ring-purple-500/20 scale-105'
            : 'border-gray-800 hover:border-blue-500/50',
        ]"
      >
        <!-- Popular Badge -->
        <div
          v-if="plan.popular"
          class="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-4 py-1 rounded-full"
        >
          {{ t('pricing.mostPopular') }}
        </div>

        <!-- Plan Header -->
        <div class="mb-6">
          <h3 class="text-2xl font-bold text-white mb-2">{{ plan.name }}</h3>
          <p class="text-gray-400 text-sm">{{ plan.description }}</p>
        </div>

        <!-- Price & Credits -->
        <div class="mb-6 space-y-4">
          <div
            class="rounded-2xl border border-blue-500/30 bg-blue-500/5 px-4 py-5 text-center"
          >
            <p class="text-xs font-semibold uppercase tracking-wide text-blue-300">
              {{ t('pricing.card.creditBadge') }}
            </p>
            <p class="mt-3 text-4xl font-bold text-white md:text-5xl">
              {{ plan.credits.toLocaleString() }}
            </p>
            <p class="text-sm text-gray-400">
              {{ t('pricing.card.creditsUnit') }}
            </p>
          </div>
          <div class="flex items-baseline justify-center gap-2 md:justify-start">
            <span class="text-4xl font-bold text-white md:text-5xl">${{ plan.priceUSDC }}</span>
            <span class="text-gray-400 text-sm font-semibold uppercase tracking-wide">USDC</span>
          </div>
          <p class="text-sm font-medium text-blue-300 text-center md:text-left">
            {{ t('pricing.card.oneTime') }}
          </p>
        </div>

        <!-- Features -->
        <ul class="space-y-3 mb-8">
          <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-3">
            <Check class="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span class="text-sm text-gray-300">{{ feature }}</span>
          </li>
        </ul>

        <!-- CTA Button -->
        <UiButton
          :disabled="purchasing"
          :class="[
            'w-full',
            plan.popular
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              : 'bg-blue-600 hover:bg-blue-700',
          ]"
          size="lg"
          @click="purchasePlan(plan.id)"
        >
          <Zap v-if="!purchasing || selectedPlanId !== plan.id" class="w-4 h-4 mr-2" />
          <Loader2 v-else class="w-4 h-4 mr-2 animate-spin" />
          {{
            purchasing && selectedPlanId === plan.id
              ? t('pricing.buttons.processing')
              : t('pricing.buttons.buy')
          }}
        </UiButton>
      </div>
    </div>

    <!-- Additional Info -->
    <div class="mt-16 text-center">
      <div
        class="inline-flex items-center gap-2 bg-zinc-900 border border-gray-800 rounded-full px-6 py-3"
      >
        <Zap class="w-5 h-5 text-yellow-400" />
        <p class="text-sm text-gray-300">
          <span class="font-semibold text-white">{{ t('pricing.notice.title') }}</span>
          {{ t('pricing.notice.description') }}
        </p>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="mt-20">
      <h2 class="text-3xl font-bold text-white text-center mb-12">
        {{ t('pricing.faq.title') }}
      </h2>
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-white mb-2">
            {{ t('pricing.faq.items.expiry.question') }}
          </h3>
          <p class="text-gray-400">
            {{ t('pricing.faq.items.expiry.answer') }}
          </p>
        </div>

        <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-white mb-2">
            {{ t('pricing.faq.items.payment.question') }}
          </h3>
          <p class="text-gray-400">
            {{ t('pricing.faq.items.payment.answer') }}
          </p>
        </div>

        <div class="bg-zinc-900 border border-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-white mb-2">
            {{ t('pricing.faq.items.refund.question') }}
          </h3>
          <p class="text-gray-400">
            {{ t('pricing.faq.items.refund.answer') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
