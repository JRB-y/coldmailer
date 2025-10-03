export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side
  if (process.server) return

  // Check localStorage directly to avoid timing issues with useState
  const token = process.client ? localStorage.getItem('auth-token') : null

  // If already authenticated and trying to access auth pages, redirect to home
  if (token) {
    return navigateTo('/')
  }
})
