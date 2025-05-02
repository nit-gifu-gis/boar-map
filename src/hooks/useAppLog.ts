import { currentAppLogs } from "@/states/appLog";
import { useAtomValue } from "jotai";

export const useAppLogs = () => {
  const appLogs = useAtomValue(currentAppLogs);

  return {
    appLogs,
  };
};
