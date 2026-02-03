import { useCallback, useState } from 'react'

export function useApiError() {
  const [error, setError] = useState<unknown>(null)

  const clearError = useCallback(() => setError(null), [])

  return { error, setError, clearError }
}
