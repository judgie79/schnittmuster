import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { authService } from '@/services'
import { useGlobalContext } from '@/context'
import type { AuthCredentials, SignupPayload } from '@/types'
import type { UserDTO } from 'shared-dtos'

const PROFILE_QUERY_KEY = ['profile']

export const useAuth = () => {
  const { state, dispatch } = useGlobalContext()
  const queryClient = useQueryClient()

  const profileQuery = useQuery<UserDTO, Error>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => authService.getProfile(),
    enabled: state.auth.isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  useEffect(() => {
    if (profileQuery.data) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: profileQuery.data })
    }
  }, [dispatch, profileQuery.data])

  const loginMutation = useMutation({
    mutationFn: (credentials: AuthCredentials) => authService.login(credentials),
    onSuccess: (user: UserDTO) => {
      dispatch({ type: 'LOGIN_SUCCESS', payload: user })
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
    },
    onError: (error: Error) => {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message })
    },
  })

  const signupMutation = useMutation({
    mutationFn: (payload: SignupPayload) => authService.signup(payload),
  })

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      dispatch({ type: 'LOGOUT' })
      queryClient.clear()
    },
  })

  return {
    state: state.auth,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoading: loginMutation.isPending || signupMutation.isPending || profileQuery.isLoading,
  }
}
