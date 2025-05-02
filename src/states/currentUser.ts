import type { User } from "@/types/user";
import { atom } from "jotai";

export const currentUserState = atom<undefined | null | User>(undefined);
