<script setup lang="ts">
import { CheckCircle, Shield, Zap, BarChart3, ArrowRight, Mail } from 'lucide-vue-next'

definePageMeta({ ssr: false })

const { user, isAuthenticated } = useAuth()
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div class="min-h-screen bg-black">
    <!-- Header -->
    <UiHeader />

    <!-- Hero Section -->
    <main>
      <div class="max-w-7xl mx-auto px-4 py-20">
        <div class="text-center max-w-4xl mx-auto mb-20">
          <h1 class="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span
              class="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-md"
            >
              {{ t('landing.hero.headlinePrimary') }}
            </span>
            <br />
            <span class="text-white">{{ t('landing.hero.headlineSecondary') }}</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-400 mb-10 leading-relaxed">
            {{ t('landing.hero.subheading') }}
          </p>
          <ClientOnly>
            <template #fallback>
              <div class="flex items-center justify-center gap-4">
                <div class="inline-flex h-14 min-w-[200px] items-center justify-center rounded-full bg-zinc-900/60 text-zinc-700">
                  {{ t('landing.hero.ctaPrimary') }}
                </div>
              </div>
            </template>
            <div class="flex items-center justify-center gap-4">
              <NuxtLink
                v-if="!isAuthenticated"
                :to="localePath('/auth/signup')"
                class="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[1px] text-white shadow-[0_0_0_rgba(0,0,0,0)] transition-all duration-300 hover:shadow-[0_0_32px_rgba(168,85,247,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
              >
                <span class="flex items-center gap-3 rounded-full bg-zinc-950/90 px-9 py-3 text-lg font-semibold transition-all duration-300 group-hover:bg-transparent">
                  {{ t('landing.hero.ctaPrimary') }}
                  <ArrowRight class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </NuxtLink>
              <NuxtLink
                v-else
                :to="localePath('/dashboard')"
                class="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[1px] text-white shadow-[0_0_0_rgba(0,0,0,0)] transition-all duration-300 hover:shadow-[0_0_32px_rgba(168,85,247,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
              >
                <span class="flex items-center gap-3 rounded-full bg-zinc-950/90 px-9 py-3 text-lg font-semibold transition-all duration-300 group-hover:bg-transparent">
                  {{ t('landing.hero.ctaDashboard') }}
                  <ArrowRight class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </NuxtLink>
            </div>
          </ClientOnly>
        </div>

        <!-- Features Grid -->
        <div class="grid md:grid-cols-3 gap-8 mb-20">
          <!-- Feature 1 -->
          <div
            class="bg-zinc-900 border border-gray-800 rounded-xl p-8 hover:border-blue-500/50 transition-colors"
          >
            <div class="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle class="w-6 h-6 text-blue-400" />
            </div>
            <h3 class="text-xl font-bold text-white mb-3">
              {{ t('landing.features.items.diagnostics.title') }}
            </h3>
            <p class="text-gray-400 leading-relaxed">
              {{ t('landing.features.items.diagnostics.description') }}
            </p>
          </div>

          <!-- Feature 2 -->
          <div
            class="bg-zinc-900 border border-gray-800 rounded-xl p-8 hover:border-purple-500/50 transition-colors"
          >
            <div
              class="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4"
            >
              <Zap class="w-6 h-6 text-purple-400" />
            </div>
            <h3 class="text-xl font-bold text-white mb-3">
              {{ t('landing.features.items.risk.title') }}
            </h3>
            <p class="text-gray-400 leading-relaxed">
              {{ t('landing.features.items.risk.description') }}
            </p>
          </div>

          <!-- Feature 3 -->
          <div
            class="bg-zinc-900 border border-gray-800 rounded-xl p-8 hover:border-pink-500/50 transition-colors"
          >
            <div class="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4">
              <Shield class="w-6 h-6 text-pink-400" />
            </div>
            <h3 class="text-xl font-bold text-white mb-3">
              {{ t('landing.features.items.compliance.title') }}
            </h3>
            <p class="text-gray-400 leading-relaxed">
              {{ t('landing.features.items.compliance.description') }}
            </p>
          </div>
        </div>

        <!-- Stats Section -->
        <div
          class="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-gray-800 rounded-2xl p-12 text-center mb-20"
        >
          <div class="grid md:grid-cols-3 gap-8">
            <div>
              <div
                class="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2"
              >
                99.5%
              </div>
              <div class="text-gray-400">{{ t('landing.stats.precision') }}</div>
            </div>
            <div>
              <div
                class="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
              >
                1000+
              </div>
              <div class="text-gray-400">{{ t('landing.stats.credits') }}</div>
            </div>
            <div>
              <div
                class="text-5xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent mb-2"
              >
                &lt;2s
              </div>
              <div class="text-gray-400">{{ t('landing.stats.latency') }}</div>
            </div>
          </div>
        </div>

        <!-- Checks Section -->
        <div class="bg-zinc-900 border border-gray-800 rounded-2xl p-12 mb-20">
          <h2 class="text-4xl font-bold text-white text-center mb-10">
            {{ t('landing.checks.title') }}
          </h2>
          <p class="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-12">
            {{ t('landing.checks.description') }}
          </p>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="flex items-start gap-4">
              <CheckCircle class="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h3 class="text-lg font-semibold text-white">
                  {{ t('landing.checks.labels.checkDns') }}
                </h3>
                <p class="text-gray-400 text-sm">
                  {{ t('landing.checks.items.checkDns') }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <CheckCircle class="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h3 class="text-lg font-semibold text-white">
                  {{ t('landing.checks.labels.checkDomainAge') }}
                </h3>
                <p class="text-gray-400 text-sm">
                  {{ t('landing.checks.items.checkDomainAge') }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <CheckCircle class="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h3 class="text-lg font-semibold text-white">
                  {{ t('landing.checks.labels.checkMxRecords') }}
                </h3>
                <p class="text-gray-400 text-sm">
                  {{ t('landing.checks.items.checkMxRecords') }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <CheckCircle class="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h3 class="text-lg font-semibold text-white">
                  {{ t('landing.checks.labels.checkSmtp') }}
                </h3>
                <p class="text-gray-400 text-sm">
                  {{ t('landing.checks.items.checkSmtp') }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <CheckCircle class="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h3 class="text-lg font-semibold text-white">
                  {{ t('landing.checks.labels.hasSuspiciousPatterns') }}
                </h3>
                <p class="text-gray-400 text-sm">
                  {{ t('landing.checks.items.hasSuspiciousPatterns') }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <CheckCircle class="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h3 class="text-lg font-semibold text-white">
                  {{ t('landing.checks.labels.isDisposable') }}
                </h3>
                <p class="text-gray-400 text-sm">
                  {{ t('landing.checks.items.isDisposable') }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <CheckCircle class="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h3 class="text-lg font-semibold text-white">
                  {{ t('landing.checks.labels.isFreeDomain') }}
                </h3>
                <p class="text-gray-400 text-sm">
                  {{ t('landing.checks.items.isFreeDomain') }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <CheckCircle class="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h3 class="text-lg font-semibold text-white">
                  {{ t('landing.checks.labels.isRoleAccount') }}
                </h3>
                <p class="text-gray-400 text-sm">
                  {{ t('landing.checks.items.isRoleAccount') }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <CheckCircle class="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h3 class="text-lg font-semibold text-white">
                  {{ t('landing.checks.labels.validateSyntax') }}
                </h3>
                <p class="text-gray-400 text-sm">
                  {{ t('landing.checks.items.validateSyntax') }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Sources Section -->
        <div class="max-w-5xl mx-auto mb-20 text-center">
          <h2 class="text-4xl font-bold text-white mb-6">
            {{ t('landing.dataSources.title') }}
          </h2>
          <p class="text-lg text-gray-400 mb-10">
            {{ t('landing.dataSources.description') }}
          </p>
          <div class="grid gap-6 md:grid-cols-3">
            <div class="bg-zinc-900 border border-gray-800 rounded-xl p-6">
              <BarChart3 class="w-8 h-8 text-blue-400 mx-auto mb-4" />
              <h3 class="text-xl font-semibold text-white mb-2">
                {{ t('landing.dataSources.cards.signals.title') }}
              </h3>
              <p class="text-gray-400 text-sm">
                {{ t('landing.dataSources.cards.signals.description') }}
              </p>
            </div>
            <div class="bg-zinc-900 border border-gray-800 rounded-xl p-6">
              <Zap class="w-8 h-8 text-purple-400 mx-auto mb-4" />
              <h3 class="text-xl font-semibold text-white mb-2">
                {{ t('landing.dataSources.cards.pings.title') }}
              </h3>
              <p class="text-gray-400 text-sm">
                {{ t('landing.dataSources.cards.pings.description') }}
              </p>
            </div>
            <div class="bg-zinc-900 border border-gray-800 rounded-xl p-6">
              <Shield class="w-8 h-8 text-pink-400 mx-auto mb-4" />
              <h3 class="text-xl font-semibold text-white mb-2">
                {{ t('landing.dataSources.cards.compliance.title') }}
              </h3>
              <p class="text-gray-400 text-sm">
                {{ t('landing.dataSources.cards.compliance.description') }}
              </p>
            </div>
          </div>
        </div>

        <!-- How It Works -->
        <div class="max-w-4xl mx-auto mb-20">
          <h2 class="text-4xl font-bold text-white text-center mb-12">
            {{ t('landing.process.title') }}
          </h2>
          <div class="space-y-6">
            <div class="flex gap-6 items-start">
              <div
                class="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold"
              >
                1
              </div>
              <div>
                <h4 class="text-xl font-semibold text-white mb-2">
                  {{ t('landing.process.steps.one.title') }}
                </h4>
                <p class="text-gray-400">
                  {{ t('landing.process.steps.one.description') }}
                </p>
              </div>
            </div>
            <div class="flex gap-6 items-start">
              <div
                class="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold"
              >
                2
              </div>
              <div>
                <h4 class="text-xl font-semibold text-white mb-2">
                  {{ t('landing.process.steps.two.title') }}
                </h4>
                <p class="text-gray-400">
                  {{ t('landing.process.steps.two.description') }}
                </p>
              </div>
            </div>
            <div class="flex gap-6 items-start">
              <div
                class="flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold"
              >
                3
              </div>
              <div>
                <h4 class="text-xl font-semibold text-white mb-2">
                  {{ t('landing.process.steps.three.title') }}
                </h4>
                <p class="text-gray-400">
                  {{ t('landing.process.steps.three.description') }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="text-center">
          <div class="inline-block bg-zinc-900 border border-gray-800 rounded-2xl p-12">
            <Mail class="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h2 class="text-3xl font-bold text-white mb-4">
              {{ t('landing.cta.title') }}
            </h2>
            <p class="text-gray-400 mb-8 max-w-md mx-auto">
              {{ t('landing.cta.description') }}
            </p>
            <ClientOnly>
              <template #fallback>
                <div class="inline-flex h-12 min-w-[200px] items-center justify-center rounded-full bg-zinc-900/60 text-zinc-700">
                  {{ t('landing.cta.primary') }}
                </div>
              </template>
              <div class="flex items-center justify-center">
                <NuxtLink
                  v-if="!isAuthenticated"
                  :to="localePath('/auth/signup')"
                  class="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[1px] text-white shadow-[0_0_0_rgba(0,0,0,0)] transition-all duration-300 hover:shadow-[0_0_32px_rgba(168,85,247,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
                >
                  <span class="flex items-center gap-3 rounded-full bg-zinc-950/90 px-8 py-2.5 text-lg font-semibold transition-all duration-300 group-hover:bg-transparent">
                    {{ t('landing.cta.primary') }}
                    <ArrowRight class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </NuxtLink>
                <NuxtLink
                  v-else
                  :to="localePath('/dashboard')"
                  class="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[1px] text-white shadow-[0_0_0_rgba(0,0,0,0)] transition-all duration-300 hover:shadow-[0_0_32px_rgba(168,85,247,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
                >
                  <span class="flex items-center gap-3 rounded-full bg-zinc-950/90 px-8 py-2.5 text-lg font-semibold transition-all duration-300 group-hover:bg-transparent">
                    {{ t('landing.hero.ctaDashboard') }}
                    <ArrowRight class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </NuxtLink>
              </div>
            </ClientOnly>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-8 px-4 mt-20 border-t border-gray-800">
      <div class="max-w-7xl mx-auto text-center text-gray-500">
        <p>{{ t('footer.copyright') }}</p>
      </div>
    </footer>
  </div>
</template>
