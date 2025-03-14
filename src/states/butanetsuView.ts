import { atom } from 'recoil';

export const butanetsuViewState = atom<undefined | null | ButanetsuView>({
  key: 'ButanetsuView',
  default: {
    radius: 10,
    month: 6,
    style: 1,
    origin: new Date(),
  },
});
