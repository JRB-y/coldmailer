<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

const { login } = useAuth()
const localePath = useLocalePath()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  const result = await login(email.value, password.value)

  loading.value = false

  if (result.success) {
    // Use navigateTo for better Nuxt 3 compatibility
    await navigateTo(localePath('/'), { replace: true })
  } else {
    error.value = result.error || 'Login failed'
  }
}
</script>

<template>
  <div class="min-h-screen bg-black flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">ColdMailer</h1>
        <p class="text-zinc-400">Sign in to your account</p>
      </div>

      <div class="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-zinc-200 mb-2"> Email </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-zinc-200 mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
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
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-zinc-400 text-sm">
            Don't have an account?
            <NuxtLink
              :to="localePath('/auth/signup')"
              class="text-blue-400 hover:text-blue-300 font-medium"
            >
              Sign up
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
