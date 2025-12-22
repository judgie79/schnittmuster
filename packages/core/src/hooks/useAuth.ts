import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { authService } from '../services/auth';
import { useAuthStore } from '../store/authStore';
import type { AuthCredentials, SignupPayload } from '../types';
import type { UserDTO } from 'schnittmuster-manager-dtos';

const PROFILE_QUERY_KEY = ['profile'];

export const useAuth = () => {
  const { user, isAuthenticated, login, logout: storeLogout, setLoading, setError } = useAuthStore();
  const queryClient = useQueryClient();
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  const profileQuery = useQuery<UserDTO, Error>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => authService.getProfile(),
    enabled: isAuthenticated || !hasCheckedSession,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (profileQuery.data) {
      login(profileQuery.data);
    }
  }, [login, profileQuery.data]);

  useEffect(() => {
    if (!hasCheckedSession && (profileQuery.isFetched || profileQuery.isError)) {
      setHasCheckedSession(true);
      setLoading(false);
    }
  }, [hasCheckedSession, profileQuery.isError, profileQuery.isFetched, setLoading]);

  const loginMutation = useMutation({
    mutationFn: (credentials: AuthCredentials) => authService.login(credentials),
    onSuccess: (user: UserDTO) => {
      login(user);
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const signupMutation = useMutation({
    mutationFn: (payload: SignupPayload) => authService.signup(payload),
    onSuccess: (user: UserDTO) => {
        login(user);
        queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
    onError: (error: Error) => {
        setError(error.message);
    }
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      storeLogout();
      queryClient.clear();
    },
  });

  return {
    user,
    isAuthenticated,
    isLoading: !hasCheckedSession || profileQuery.isLoading,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginPending: loginMutation.isPending,
    isSignupPending: signupMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
    error: loginMutation.error || signupMutation.error || logoutMutation.error,
  };
};
