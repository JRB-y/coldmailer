<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

const { t } = useI18n()

const { data: articles } = await useAsyncData('blog-list', () =>
  queryContent('blog').sort({ date: -1 }).find()
)

const formatDate = (value?: string) => {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

useHead({
  title: `${t('landing.blog.title')} | ValixMail`,
  meta: [
    {
      name: 'description',
      content:
        t('landing.blog.description') ||
        'Insights and playbooks to keep your cold outreach deliverable and client-ready.',
    },
  ],
})
</script>

<template>
  <section class="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-white mb-4">
        {{ t('blog.title') }}
      </h1>
      <p class="text-lg text-gray-400 max-w-3xl mx-auto">
        {{ t('blog.description') }}
      </p>
    </div>

    <div v-if="articles?.length" class="space-y-8">
      <article
        v-for="article in articles"
        :key="article._id"
        class="bg-zinc-900 border border-gray-800 rounded-2xl p-8 transition hover:border-blue-500/40"
      >
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div class="text-sm text-blue-300 font-medium uppercase tracking-wide">
            {{ article.readingTime || '5 min read' }}
          </div>
          <div class="text-sm text-gray-500">
            {{ formatDate(article.date) }}
          </div>
        </div>
        <NuxtLink :to="article._path">
          <h2 class="text-2xl font-semibold text-white mb-3">
            {{ article.title }}
          </h2>
        </NuxtLink>
        <p class="text-gray-400 mb-6">
          {{ article.description }}
        </p>
        <NuxtLink
          :to="article._path"
          class="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 font-medium"
        >
          {{ t('blog.cta') }}
          <ArrowRight class="w-4 h-4" />
        </NuxtLink>
      </article>
    </div>

    <div v-else class="text-center text-gray-500">
      <p>No blog posts published yet. Check back soon!</p>
    </div>
  </section>
</template>
