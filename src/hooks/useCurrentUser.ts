import { currentUserState } from "@/states/currentUser";
import { useAtomValue } from "jotai";

export const useCurrentUser = () => {
  const currentUser = useAtomValue(currentUserState);
  const isAuthChecking = currentUser === undefined;

  return {
    currentUser,
    isAuthChecking,
  };
};
