import { sessions } from "$lib/stores/core";
import { redirect } from "@sveltejs/kit";
import { derived } from "svelte/store";

export const ssr = false;

export function load({ params }) {
	const noteId = params.id;

	const note = derived(sessions, ($sessions) => {
		const note = $sessions.find((session) => session.id === noteId);
		if (!note) throw redirect(303, "/notes");
		return note;
	});

	return {
		note
	};
}
