// useAuth Hook - Integration with React Query
import { useAuthStore } from '@/store'
import { useMutation } from '@tanstack/react-query'
import { authService } from '../services'
import type { LoginInformation } from '../types'


export function useAuth() {
  const { user, isAuthenticated } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: (info: LoginInformation) => authService.login(info)
  })

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutateAsync,
    isLoading: loginMutation.isPending,
    error: loginMutation.error ? (loginMutation.error as Error).message : null,
    isError: loginMutation.isError
  }
}
