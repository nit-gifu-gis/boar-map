import type { AppLog } from "@/types/log";
import { atom } from "jotai";

export const currentAppLogs = atom<AppLog[]>([]);
