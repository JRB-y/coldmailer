<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    fallback?: string
  }>(),
  {
    fallback: '/',
  }
)

const router = useRouter()
const localePath = useLocalePath()
const localeRoute = useLocaleRoute()
const { t } = useI18n()

const target = computed(() => {
  const localized = localeRoute(props.fallback)
  return localized?.fullPath ?? localePath(props.fallback)
})

function handleClick(event: MouseEvent) {
  if (process.client && window.history.length > 1) {
    event.preventDefault()
    router.back()
  }
}
</script>

<template>
  <NuxtLink
    :to="target"
    class="group inline-flex items-center gap-2 rounded-full border border-gray-800/80 bg-zinc-900/70 px-4 py-2 text-sm font-medium text-gray-300 transition-all hover:border-blue-500/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 w-fit"
    @click="handleClick"
  >
    <span
      class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 transition-colors group-hover:bg-blue-500/20 group-hover:text-blue-300"
    >
      <ArrowLeft class="h-4 w-4" />
    </span>
    <span>{{ t('common.back') }}</span>
  </NuxtLink>
</template>
