import { useRecoilValue } from 'recoil';
import { currentAppLogs } from '../states/appLog';

export const useAppLogs = () => {
  const appLogs = useRecoilValue(currentAppLogs);

  return {
    appLogs
  };
};
