<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, createError } from '#app'
// import { ContentRenderer, queryContent, useContentHead } from '#content'

const route = useRoute()
const router = useRouter()

const { data: articles } = await useAsyncData('blog', () => queryContent('blog').find())

const article = computed(() =>
  articles.value?.find((entry) => entry._path === `/blog/${route.params.slug}`)
)

if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found' })
}

useContentHead(article)

const formatDate = (value?: string) => {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <section class="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
    <button
      type="button"
      class="mb-6 inline-flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200"
      @click="goBack"
    >
      ← Back
    </button>

    <article>
      <header class="mb-8">
        <p class="text-sm text-blue-300 font-medium uppercase tracking-wide">
          {{ article.readingTime || '5 min read' }} • {{ formatDate(article.date) }}
        </p>
        <h1 class="text-4xl font-bold text-white mb-4">
          {{ article.title }}
        </h1>
        <p v-if="article.description" class="text-gray-400 text-lg">
          {{ article.description }}
        </p>
      </header>

      <article class="prose-blue max-w-3xl mx-auto py-16 px-4 text-white prose-compact">
        <ContentRenderer :value="article" />
      </article>

      <!-- <ContentRenderer :value="article" class="prose prose-invert prose-lg max-w-none text-white" /> -->
    </article>
  </section>
</template>

<style scoped>
.prose-compact p {
  margin: 0.4em 0 !important;
}
.prose-compact h2,
.prose-compact h3 {
  margin-top: 1em !important;
  margin-bottom: 0.4em !important;
}
.prose-compact ul,
.prose-compact ol {
  margin: 0.4em 0 !important;
}
.prose-compact li {
  margin-bottom: 0.2em !important;
}
</style>
