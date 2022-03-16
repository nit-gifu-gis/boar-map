import { atom } from 'recoil';
import { User } from '../types/user';

export const currentUserState = atom<undefined | null | User>({
  key: 'CurrentUser',
  default: undefined,
});
