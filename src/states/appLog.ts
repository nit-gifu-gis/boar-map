import { createStateContext } from './context';

export const [AppLogsProvider, useAppLogsValue, useSetAppLogs] = createStateContext<AppLog[]>(
  'AppLogs',
  () => [],
);
