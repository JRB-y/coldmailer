export const useBulk = () => {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl
  const { token } = useAuth()

  // Upload CSV file for bulk validation
  const uploadCSV = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const authToken = process.client ? localStorage.getItem('auth-token') : token.value

      if (!authToken) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`${apiUrl}/api/bulk/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle insufficient credits error specially
        if (response.status === 402) {
          const message = data.message || `Insufficient credits. Required: ${data.required || 'N/A'}, Available: ${data.available || 'N/A'}`
          throw new Error(message)
        }
        throw new Error(data.message || data.error || 'Upload failed')
      }

      return { success: true, data }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Upload failed',
      }
    }
  }

  // Get all bulk jobs (with optional status filter)
  const getJobs = async (status?: string) => {
    try {
      const authToken = process.client ? localStorage.getItem('auth-token') : token.value

      if (!authToken) {
        throw new Error('Authentication required')
      }

      const url = status
        ? `${apiUrl}/api/bulk/jobs?status=${status}`
        : `${apiUrl}/api/bulk/jobs`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch jobs')
      }

      return { success: true, jobs: data.jobs }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch jobs',
      }
    }
  }

  // Get specific job details
  const getJob = async (jobId: string) => {
    try {
      const authToken = process.client ? localStorage.getItem('auth-token') : token.value

      if (!authToken) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`${apiUrl}/api/bulk/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch job')
      }

      return { success: true, job: data }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch job',
      }
    }
  }

  // Download job results
  const downloadResults = async (jobId: string) => {
    try {
      const authToken = process.client ? localStorage.getItem('auth-token') : token.value

      if (!authToken) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`${apiUrl}/api/bulk/jobs/${jobId}/download`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || data.error || 'Download failed')
      }

      // Get the blob and create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `validated-results-${jobId}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Download failed',
      }
    }
  }

  // Get validations for a specific job
  const getJobValidations = async (jobId: string, page = 1, limit = 50) => {
    try {
      const authToken = process.client ? localStorage.getItem('auth-token') : token.value

      if (!authToken) {
        throw new Error('Authentication required')
      }

      const response = await fetch(
        `${apiUrl}/api/bulk/jobs/${jobId}/validations?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch validations')
      }

      return { success: true, ...data }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch validations',
      }
    }
  }

  return {
    uploadCSV,
    getJobs,
    getJob,
    getJobValidations,
    downloadResults,
  }
}
