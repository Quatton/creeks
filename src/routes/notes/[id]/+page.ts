import { sessions } from "$lib/stores/core.js";
import { error } from "@sveltejs/kit";
import { derived } from "svelte/store";

export const ssr = false;

export function load({ params }) {
	const noteId = params.id;

	const note = derived(sessions, ($sessions) => {
		const note = $sessions.find((session) => session.id === noteId);
		if (!note) throw error(404, "Note not found");
		return note;
	});

	return {
		note
	};
}
