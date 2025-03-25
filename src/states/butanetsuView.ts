import { atom } from 'recoil';

export const butanetsuViewState = atom<undefined | null | ButanetsuView>({
  key: 'ButanetsuView',
  default: {
    radius: 10,
    days: 180,
    style: 1,
    origin: new Date(),
  },
});
