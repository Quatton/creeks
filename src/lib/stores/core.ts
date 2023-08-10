import { localStorageStore } from "@skeletonlabs/skeleton";
import type { CreekSession } from "../types/core";

export const currentSession = localStorageStore<CreekSession | null>(
	"currentSession",
	null
);

export const sessions = localStorageStore<CreekSession[]>("sessions", []);
