import type { DisappearingSettings } from "$lib/types/disappearing";
import { writable } from "svelte/store";

function disappearingService() {
	const { subscribe, update } = writable<DisappearingSettings[]>([]);

	return {
		subscribe,
		add: (settings: DisappearingSettings) => {
			if (!settings.id) settings.id = crypto.randomUUID();
			update((settingsList) => [...settingsList, settings]);
		},
		remove: (id: string) =>
			update((settingsList) =>
				settingsList.filter((settings) => settings.id !== id)
			)
	};
}

export const disappearingStore = disappearingService();
