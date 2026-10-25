import { createStateContext } from './context';

export const [ButanetsuViewProvider, useButanetsuViewValue, useSetButanetsuView] =
  createStateContext<ButanetsuView | null | undefined>('ButanetsuView', () => ({
    radius: 10,
    days: 180,
    style: 1,
    origin: new Date(),
  }));
