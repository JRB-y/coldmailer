<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

const { register } = useAuth()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const showPasswordRequirements = ref(false)

// Real-time password validation
const passwordChecks = computed(() => {
  const pwd = password.value
  return {
    length: pwd.length >= 10,
    uppercase: /[A-Z]/.test(pwd),
    number: /\d/.test(pwd),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    notCommon: pwd.length > 0 && !isCommonPassword(pwd),
  }
})

const isPasswordValid = computed(() => {
  return (
    passwordChecks.value.length &&
    passwordChecks.value.uppercase &&
    passwordChecks.value.number &&
    passwordChecks.value.symbol &&
    passwordChecks.value.notCommon
  )
})

// Check for common passwords (basic check - backend has full list)
const isCommonPassword = (pwd: string) => {
  const common = ['password', 'password123', '123456', '12345678', 'qwerty', 'abc123', 'welcome']
  return common.includes(pwd.toLowerCase())
}

const handleSignup = async () => {
  error.value = ''

  // Validate password
  if (!isPasswordValid.value) {
    error.value = 'Password does not meet security requirements'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true

  const result = await register(email.value, password.value)

  loading.value = false

  if (result.success) {
    // Use navigateTo for better Nuxt 3 compatibility
    await navigateTo('/', { replace: true })
  } else {
    // Handle error with details if available
    if (result.error && typeof result.error === 'object' && result.error.details) {
      error.value = result.error.details.join(', ')
    } else {
      error.value = result.error || 'Registration failed'
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-black flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">Valix Mailer</h1>
        <p class="text-zinc-400">Create your account</p>
      </div>

      <div class="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
        <form @submit.prevent="handleSignup" class="space-y-6">
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
              @focus="showPasswordRequirements = true"
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />

            <!-- Password Requirements -->
            <div
              v-if="showPasswordRequirements"
              class="mt-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded-md space-y-1.5"
            >
              <p class="text-xs font-medium text-zinc-300 mb-2">Password must include:</p>
              <div class="space-y-1">
                <div class="flex items-center text-xs">
                  <span
                    :class="
                      passwordChecks.length
                        ? 'text-green-400'
                        : password.length > 0
                          ? 'text-red-400'
                          : 'text-zinc-500'
                    "
                  >
                    {{ passwordChecks.length ? '✓' : '○' }}
                  </span>
                  <span class="ml-2 text-zinc-400">At least 10 characters</span>
                </div>
                <div class="flex items-center text-xs">
                  <span
                    :class="
                      passwordChecks.uppercase
                        ? 'text-green-400'
                        : password.length > 0
                          ? 'text-red-400'
                          : 'text-zinc-500'
                    "
                  >
                    {{ passwordChecks.uppercase ? '✓' : '○' }}
                  </span>
                  <span class="ml-2 text-zinc-400">One uppercase letter (A-Z)</span>
                </div>
                <div class="flex items-center text-xs">
                  <span
                    :class="
                      passwordChecks.number
                        ? 'text-green-400'
                        : password.length > 0
                          ? 'text-red-400'
                          : 'text-zinc-500'
                    "
                  >
                    {{ passwordChecks.number ? '✓' : '○' }}
                  </span>
                  <span class="ml-2 text-zinc-400">One number (0-9)</span>
                </div>
                <div class="flex items-center text-xs">
                  <span
                    :class="
                      passwordChecks.symbol
                        ? 'text-green-400'
                        : password.length > 0
                          ? 'text-red-400'
                          : 'text-zinc-500'
                    "
                  >
                    {{ passwordChecks.symbol ? '✓' : '○' }}
                  </span>
                  <span class="ml-2 text-zinc-400">One symbol (!@#$%^&* etc.)</span>
                </div>
                <div class="flex items-center text-xs">
                  <span
                    :class="
                      passwordChecks.notCommon
                        ? 'text-green-400'
                        : password.length > 0
                          ? 'text-red-400'
                          : 'text-zinc-500'
                    "
                  >
                    {{ passwordChecks.notCommon ? '✓' : '○' }}
                  </span>
                  <span class="ml-2 text-zinc-400">Not a common password</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-zinc-200 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <div v-if="error" class="bg-red-500/10 border border-red-500/20 rounded-md p-3">
            <p class="text-sm text-red-400">{{ error }}</p>
          </div>

          <div class="bg-blue-500/10 border border-blue-500/20 rounded-md p-3">
            <p class="text-sm text-blue-400">🎁 Get 1000 free credits upon registration!</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-zinc-400 text-sm">
            Already have an account?
            <NuxtLink to="/auth/login" class="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
