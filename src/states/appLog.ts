import { atom } from 'recoil';

export const currentAppLogs = atom<AppLog[]>({
  key: 'AppLog',
  default: [],
});
