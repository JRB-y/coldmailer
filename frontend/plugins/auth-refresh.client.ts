/**
 * Client-side plugin to refresh user data on navigation
 * Ensures credits are always up-to-date across the app
 */
export default defineNuxtPlugin(() => {
  const { fetchUser, isAuthenticated } = useAuth()
  const router = useRouter()

  // Refresh user data on initial load if authenticated
  if (isAuthenticated.value) {
    fetchUser()
  }

  // Refresh user data after each navigation (with debouncing)
  let lastRefresh = 0
  const DEBOUNCE_MS = 3000 // 3 seconds between auto-refreshes

  router.afterEach(async (to, from) => {
    // Only fetch if authenticated and navigating between different pages
    if (isAuthenticated.value && to.path !== from.path) {
      // Don't fetch on auth pages (login/signup)
      if (!to.path.startsWith('/auth/')) {
        const now = Date.now()
        if (now - lastRefresh > DEBOUNCE_MS) {
          lastRefresh = now
          await fetchUser()
        }
      }
    }
  })

  // Provide a global method to manually refresh
  return {
    provide: {
      refreshUser: fetchUser,
    },
  }
})
