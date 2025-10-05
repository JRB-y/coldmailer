<script setup lang="ts">
import { computed } from 'vue'
import { Github, Twitter, Globe, ExternalLink, Mail } from 'lucide-vue-next'

const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const router = useRouter()

const localeOptions = computed(() => {
  const flagByCode: Record<string, string> = {
    en: '🇺🇸',
    fr: '🇫🇷',
    es: '🇪🇸',
    zh: '🇨🇳',
  }

  return locales.value.map((entry) => ({
    code: entry.code,
    name: entry.name || entry.code.toUpperCase(),
    flag: flagByCode[entry.code] || '🏳️',
  }))
})

function selectLocale(code: string) {
  const localizedPath = switchLocalePath(code)
  if (localizedPath) {
    router.push(localizedPath)
  }
}
</script>

<template>
  <footer class="border-t border-gray-800 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-black">
    <div class="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-14">
      <div class="grid gap-8 md:grid-cols-3">
        <div class="space-y-4">
          <NuxtLink :to="localePath('/')" class="flex items-center gap-2 text-white">
            <div
              class="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-2xl font-semibold"
            >
              Valix
            </div>
          </NuxtLink>
          <p class="max-w-sm text-sm text-zinc-500">
            {{ t('footer.tagline') }}
          </p>
          <div class="flex items-center gap-3 text-sm text-zinc-500">
            <Mail class="h-4 w-4 text-blue-400" />
            <a href="mailto:contact@valixmail.com" class="hover:text-blue-300 transition-colors"
              >contact@valixmail.com</a
            >
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6 text-sm text-zinc-400">
          <div class="space-y-3">
            <p class="text-xs uppercase tracking-wide text-zinc-500">
              {{ t('footer.links.product') }}
            </p>
            <div class="flex flex-col gap-2">
              <NuxtLink :to="localePath('/dashboard')" class="hover:text-white transition-colors">
                {{ t('header.menu.dashboard') }}
              </NuxtLink>
              <NuxtLink :to="localePath('/history')" class="hover:text-white transition-colors">
                {{ t('header.menu.history') }}
              </NuxtLink>
              <NuxtLink :to="localePath('/bulk')" class="hover:text-white transition-colors">
                {{ t('header.menu.bulk') }}
              </NuxtLink>
              <NuxtLink :to="localePath('/pricing')" class="hover:text-white transition-colors">
                {{ t('header.menu.buyCredits') }}
              </NuxtLink>
            </div>
          </div>
          <div class="space-y-3">
            <p class="text-xs uppercase tracking-wide text-zinc-500">
              {{ t('footer.links.company') }}
            </p>
            <div class="flex flex-col gap-2">
              <a href="#" class="hover:text-white transition-colors">
                {{ t('footer.links.about') }}
              </a>
              <a href="#" class="hover:text-white transition-colors">
                {{ t('footer.links.blog') }}
              </a>
              <a href="#" class="hover:text-white transition-colors">
                {{ t('footer.links.careers') }}
              </a>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <p class="text-xs uppercase tracking-wide text-zinc-500">
            {{ t('footer.language.title') }}
          </p>
          <div class="rounded-2xl border border-gray-800/80 bg-zinc-950/60 p-4">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-2 text-sm text-zinc-300">
                <Globe class="h-4 w-4 text-blue-400" />
                <span class="font-medium text-white">
                  {{ t(`header.language.items.${locale}`) }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <Github class="h-4 w-4 text-zinc-500 hover:text-white transition" />
                <Twitter class="h-4 w-4 text-zinc-500 hover:text-white transition" />
                <ExternalLink class="h-4 w-4 text-zinc-500 hover:text-white transition" />
              </div>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <button
                v-for="option in localeOptions"
                :key="option.code"
                type="button"
                class="flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm transition-colors"
                :class="[
                  locale === option.code
                    ? 'border-blue-500/40 bg-blue-500/10 text-blue-200'
                    : 'bg-zinc-900/60 text-zinc-400 hover:bg-zinc-900 hover:text-white',
                ]"
                @click="selectLocale(option.code)"
              >
                <span class="text-lg" aria-hidden="true">{{ option.flag }}</span>
                <span>{{ t(`header.language.items.${option.code}`) }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        class="flex flex-col gap-4 border-t border-gray-800/60 pt-6 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between"
      >
        <p>© {{ new Date().getFullYear() }} Valix. {{ t('footer.rights') }}</p>
        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink :to="localePath('/privacy')" class="hover:text-white transition-colors">
            {{ t('footer.links.privacy') }}
          </NuxtLink>
          <span class="h-3 w-px bg-gray-700"></span>
          <NuxtLink :to="localePath('/terms')" class="hover:text-white transition-colors">
            {{ t('footer.links.terms') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
