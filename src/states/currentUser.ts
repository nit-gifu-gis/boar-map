import { atom } from 'recoil';

export const currentUserState = atom<undefined | null | User>({
  key: 'CurrentUser',
  default: undefined,
});
