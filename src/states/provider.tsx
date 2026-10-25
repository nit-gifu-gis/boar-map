import { AppLogsProvider } from './appLog';
import { ButanetsuViewProvider } from './butanetsuView';
import { CurrentUserProvider } from './currentUser';

import type { PropsWithChildren } from 'react';

export const AppStateProvider = ({ children }: PropsWithChildren) => (
  <CurrentUserProvider>
    <ButanetsuViewProvider>
      <AppLogsProvider>{children}</AppLogsProvider>
    </ButanetsuViewProvider>
  </CurrentUserProvider>
);
