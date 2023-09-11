import { localStorageStore } from "@skeletonlabs/skeleton";
import type { CreekNote, CreekSession } from "../types/core";

export const currentSession = localStorageStore<CreekSession | null>(
	"currentSession",
	null
);

export const sessions = localStorageStore<CreekNote[]>("sessions", []);
