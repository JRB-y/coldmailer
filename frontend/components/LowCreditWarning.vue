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
    class="mb-6 rounded-xl border border-yellow-800/40 bg-gradient-to-r from-yellow-950/40 to-orange-950/40 px-4 py-3 text-sm text-yellow-300"
  >
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10">
        <AlertCircle class="h-4 w-4" />
      </div>
      <div class="flex-1 min-w-[200px]">
        <span class="font-semibold text-yellow-200">
          {{ t('dashboard.lowCredits.title') }}
        </span>
        <span class="ml-2 text-yellow-100/80">
          {{
            t('dashboard.lowCredits.description', {
              credits: Intl.NumberFormat(locale).format(user.credits || 0),
            })
          }}
        </span>
      </div>
      <NuxtLink
        :to="localePath('/pricing')"
        class="inline-flex items-center gap-2 rounded-full border border-yellow-500/50 bg-yellow-500/10 px-3 py-1.5 text-xs font-semibold text-yellow-200 transition-colors hover:border-yellow-400 hover:text-white"
      >
        <TrendingUp class="h-3.5 w-3.5" />
        {{ t('dashboard.lowCredits.cta') }}
      </NuxtLink>
    </div>
  </div>
</template>
