<script setup lang="ts">
import { computed } from 'vue'

const { t } = useI18n()

type LegalSection = {
  heading: string
  body: string[]
}

const title = computed(() => t('legal.privacy.title'))
const updated = computed(() => t('legal.privacy.updated'))
const sections = computed<LegalSection[]>(
  () => t('legal.privacy.sections', { returnObjects: true }) as unknown as LegalSection[]
)
</script>

<template>
  <div class="min-h-screen bg-black">
    <UiHeader />

    <main class="py-12 px-4">
      <div class="max-w-4xl mx-auto space-y-10">
        <div class="space-y-4">
          <UiBackButton />
          <h1 class="text-4xl md:text-5xl font-bold text-white">{{ title }}</h1>
          <p class="text-sm text-gray-400 uppercase tracking-wide">{{ updated }}</p>
          <p class="text-base text-gray-300 leading-relaxed">
            {{ t('legal.privacy.intro') }}
          </p>
        </div>

        <div class="space-y-12">
          <section v-for="section in sections" :key="section.heading" class="space-y-4">
            <h2 class="text-2xl font-semibold text-white">{{ section.heading }}</h2>
            <p v-for="paragraph in section.body" :key="paragraph" class="text-gray-300 leading-relaxed">
              {{ paragraph }}
            </p>
          </section>
        </div>

        <div class="border border-gray-800 rounded-2xl p-6 bg-zinc-900/40">
          <h3 class="text-lg font-semibold text-white mb-2">{{ t('legal.contact.title') }}</h3>
          <p class="text-gray-300 leading-relaxed">{{ t('legal.contact.description') }}</p>
          <a
            class="mt-3 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            href="mailto:legal@valix.dev"
          >
            legal@valix.dev
          </a>
        </div>
      </div>
    </main>
  </div>
</template>
