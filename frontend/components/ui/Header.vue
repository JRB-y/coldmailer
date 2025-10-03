<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuth()
const router = useRouter()

function handleLogout() {
  logout()
  router.push('/')
}
</script>
<template>
  <header class="py-6 px-4 border-b border-gray-800">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="text-2xl font-bold text-white">ColdMailer</div>

      <!-- Navigation -->
      <div v-if="isAuthenticated && user" class="flex items-center gap-6">
        <NuxtLink
          to="/dashboard"
          class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          Dashboard
        </NuxtLink>
        <NuxtLink
          to="/history"
          class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          History
        </NuxtLink>
        <div class="text-right">
          <p class="text-sm text-gray-400">{{ user.email }}</p>
          <p class="text-sm font-semibold text-white">
            <span class="text-blue-400">{{ user.credits }}</span> credits
          </p>
        </div>
        <button
          @click="handleLogout"
          class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>

      <!-- Auth Buttons for Guests -->
      <div v-else class="flex items-center gap-3">
        <NuxtLink
          to="/auth/login"
          class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          Login
        </NuxtLink>
        <NuxtLink
          to="/auth/signup"
          class="px-6 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Get Started
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
