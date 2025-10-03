export const useAuth = () => {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl

  // State - initialize from localStorage
  const token = useState<string | null>('auth-token', () => null)
  const user = useState<any>('auth-user', () => null)

  // Initialize from localStorage on client
  if (process.client && !token.value) {
    const storedToken = localStorage.getItem('auth-token')
    const storedUser = localStorage.getItem('auth-user')

    if (storedToken) {
      token.value = storedToken
    }
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
  }

  const isAuthenticated = computed(() => !!token.value)

  // Register
  const register = async (email: string, password: string) => {
    try {
      const response = await $fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        body: { email, password },
      })

      if (response.token && response.user) {
        token.value = response.token
        user.value = response.user

        // Store in localStorage
        if (process.client) {
          localStorage.setItem('auth-token', response.token)
          localStorage.setItem('auth-user', JSON.stringify(response.user))
        }

        return { success: true, user: response.user }
      }

      return { success: false, error: 'Registration failed' }
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.error || error.message || 'Registration failed'
      }
    }
  }

  // Login
  const login = async (email: string, password: string) => {
    try {
      const response = await $fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        body: { email, password },
      })

      if (response.token && response.user) {
        token.value = response.token
        user.value = response.user

        // Store in localStorage
        if (process.client) {
          localStorage.setItem('auth-token', response.token)
          localStorage.setItem('auth-user', JSON.stringify(response.user))
        }

        return { success: true, user: response.user }
      }

      return { success: false, error: 'Login failed' }
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.error || error.message || 'Login failed'
      }
    }
  }

  // Logout
  const logout = () => {
    token.value = null
    user.value = null

    if (process.client) {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('auth-user')
    }
  }

  // Fetch current user
  const fetchUser = async () => {
    if (!token.value) return

    try {
      const response = await $fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      if (response.user) {
        user.value = response.user
        if (process.client) {
          localStorage.setItem('auth-user', JSON.stringify(response.user))
        }
      }
    } catch (error) {
      // Token might be invalid, logout
      logout()
    }
  }

  // Update user credits (after validation)
  const updateCredits = (newCredits: number) => {
    if (user.value) {
      user.value = { ...user.value, credits: newCredits }
      if (process.client) {
        localStorage.setItem('auth-user', JSON.stringify(user.value))
      }
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    register,
    login,
    logout,
    fetchUser,
    updateCredits,
  }
}
