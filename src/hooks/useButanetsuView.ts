import { useAtomValue } from "jotai";
import { butanetsuViewState } from "../states/butanetsuView";

export const useButanetsuView = () => {
  const currentView = useAtomValue(butanetsuViewState);

  return {
    currentView,
  };
};
