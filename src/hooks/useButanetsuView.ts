import { useRecoilValue } from 'recoil';
import { butanetsuViewState } from '../states/butanetsuView';

export const useButanetsuView = () => {
  const currentView = useRecoilValue(butanetsuViewState);

  return {
    currentView
  };
};
