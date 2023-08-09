import { writable } from "svelte/store";
import type { CreekSession } from "../types/core";

export const currentSession = writable<CreekSession | null>(null);
