<script setup>
import { TrendingUp, AlertCircle } from 'lucide-vue-next'

const {
  public: { minCreditWarning },
} = useRuntimeConfig()

const { user } = useAuth()
const { t, locale } = useI18n()
</script>

<template>
  <!-- Low Credits Warning -->
  <div
    v-if="user && user.credits < minCreditWarning"
    class="mb-8 bg-gradient-to-r from-yellow-950/50 to-orange-950/50 border border-yellow-800/50 rounded-lg p-6"
  >
    <div class="flex items-start gap-4">
      <div
        class="flex-shrink-0 w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center"
      >
        <AlertCircle class="w-6 h-6 text-yellow-400" />
      </div>
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-yellow-400 mb-1">
          {{ t('dashboard.lowCredits.title') }}
        </h3>
        <p class="text-sm text-gray-300 mb-4">
          {{
            t('dashboard.lowCredits.description', {
              credits: Intl.NumberFormat(locale).format(user.credits || 0),
            })
          }}
        </p>
        <NuxtLink
          :to="localePath('/pricing')"
          class="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          <TrendingUp class="w-4 h-4" />
          {{ t('dashboard.lowCredits.cta') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
