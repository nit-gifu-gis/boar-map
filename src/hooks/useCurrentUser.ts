import { useCurrentUserValue } from '@/states/currentUser';

export const useCurrentUser = () => {
  const currentUser = useCurrentUserValue();
  const isAuthChecking = currentUser === undefined;

  return {
    currentUser,
    isAuthChecking,
  };
};
