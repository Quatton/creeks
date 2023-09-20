import { localStorageStore } from "@skeletonlabs/skeleton";
import type { CreekNote, CreekSession } from "../types/core";
import { derived, type Writable } from "svelte/store";

export const currentSession = localStorageStore<CreekSession | null>(
	"currentSession",
	null
);

export const sessions = localStorageStore<CreekNote[]>("sessions", []);

export const getNoteStore: (id: string) => Writable<CreekNote> = (id) => {
	const note = derived(sessions, ($sessions) => {
		const index = $sessions.findIndex((session) => session.id === id);
		return $sessions[index];
	});

	return {
		subscribe: note.subscribe,
		set: (value: CreekNote) => {
			sessions.update(($sessions) => {
				const index = $sessions.findIndex((session) => session.id === id);
				if (index === -1) return $sessions;
				$sessions[index] = value;
				return $sessions;
			});
		},
		update(updater) {
			sessions.update(($sessions) => {
				const index = $sessions.findIndex((session) => session.id === id);
				if (index === -1) return $sessions;
				$sessions[index] = updater($sessions[index]);
				return $sessions;
			});
		}
	};
};
