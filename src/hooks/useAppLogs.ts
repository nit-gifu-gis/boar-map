import { useAppLogsValue } from '@/states/appLog';

export const useAppLogs = () => {
  const appLogs = useAppLogsValue();

  return {
    appLogs,
  };
};
