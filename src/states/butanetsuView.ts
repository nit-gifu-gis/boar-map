import type { ButanetsuView } from "@/types/butanetsuView";
import { atom } from "jotai";

export const butanetsuViewState = atom<undefined | null | ButanetsuView>({
  radius: 10,
  days: 180,
  style: 1,
  origin: new Date(),
});
