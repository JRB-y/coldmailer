export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side
  if (process.server) return

  // Check localStorage directly to avoid timing issues with useState
  const token = process.client ? localStorage.getItem('auth-token') : null

  // If trying to access protected route without auth, redirect to login
  if (!token) {
    return navigateTo('/auth/login')
  }
})
