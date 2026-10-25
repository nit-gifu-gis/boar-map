import { createStateContext } from './context';

import type { User } from '../types/user';

// undefined: checking authentication, null: signed out.
export const [CurrentUserProvider, useCurrentUserValue, useSetCurrentUser] =
  createStateContext<User | null | undefined>('CurrentUser', () => undefined);
