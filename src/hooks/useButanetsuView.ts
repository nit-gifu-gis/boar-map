import { useButanetsuViewValue } from '@/states/butanetsuView';

export const useButanetsuView = () => {
  const currentView = useButanetsuViewValue();

  return {
    currentView,
  };
};
