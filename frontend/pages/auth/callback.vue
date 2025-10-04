<script setup lang="ts">
import { onMounted } from 'vue'
import { Loader2 } from 'lucide-vue-next'

definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()

onMounted(async () => {
  const token = route.query.token as string
  const error = route.query.error as string

  if (error) {
    await router.push(localePath('/auth/login?error=google_auth_failed'))
    return
  }

  if (token) {
    // Store the token
    localStorage.setItem('auth-token', token)

    // Redirect to dashboard
    await router.push(localePath('/'))
  } else {
    await router.push(localePath('/auth/login'))
  }
})
</script>

<template>
  <div class="min-h-screen bg-black flex items-center justify-center">
    <div class="text-center">
      <Loader2 class="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
      <p class="text-gray-400">Completing sign in...</p>
    </div>
  </div>
</template>
