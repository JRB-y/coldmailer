<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

const { t } = useI18n()
const { login } = useAuth()
const localePath = useLocalePath()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl
const googleAuthEnabled = computed(() => Boolean(config.public.googleAuthEnabled))

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  const result = await login(email.value, password.value)

  loading.value = false

  if (result.success) {
    // Use navigateTo for better Nuxt 3 compatibility
    await navigateTo(localePath('/'), { replace: true })
  } else {
    error.value = result.error || t('auth.login.error')
  }
}

const handleGoogleLogin = () => {
  if (!googleAuthEnabled.value) {
    return
  }

  window.location.href = `${apiUrl}/api/auth/google`
}
</script>

<template>
  <div class="min-h-screen bg-black flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">{{ t('auth.common.brand') }}</h1>
        <p class="text-zinc-400">{{ t('auth.login.subtitle') }}</p>
      </div>

      <div class="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-zinc-200 mb-2">
              {{ t('auth.common.email') }}
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :placeholder="t('auth.common.emailPlaceholder')"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-zinc-200 mb-2">
              {{ t('auth.common.password') }}
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :placeholder="t('auth.common.passwordPlaceholder')"
            />
          </div>

          <div v-if="error" class="bg-red-500/10 border border-red-500/20 rounded-md p-3">
            <p class="text-sm text-red-400">{{ error }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {{ loading ? t('auth.login.submitting') : t('auth.login.submit') }}
          </button>
        </form>

        <div v-if="googleAuthEnabled" class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-zinc-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-zinc-900 text-zinc-400">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            @click="handleGoogleLogin"
            class="mt-4 w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-medium py-2 px-4 rounded-md transition-colors"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>

        <div class="mt-6 text-center">
          <p class="text-zinc-400 text-sm">
            {{ t('auth.login.ctaText') }}
            <NuxtLink
              :to="localePath('/auth/signup')"
              class="text-blue-400 hover:text-blue-300 font-medium"
            >
              {{ t('auth.login.ctaLink') }}
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
