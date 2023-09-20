import { sessions } from "$lib/stores/core";
import { error } from "@sveltejs/kit";
import { derived, get } from "svelte/store";
import type { PageLoad } from "./$types";

export const ssr = false;

export const load: PageLoad = async ({ params, parent }) => {
	const noteId = params.id;
	const folder = params.folder;
	if (folder === "local") {
		const note = get(
			derived(sessions, ($sessions) => {
				return $sessions.find((session) => session.id === noteId);
			})
		);
		if (!note) throw error(404, "Local note not found");

		return {
			note,
			folder: "local" as const
		};
	}

	if (folder === "shared") {
		const { supabase } = await parent();
		const note = (
			await supabase.from("shared_notes").select("*").eq("id", noteId).single()
		).data;

		if (!note) throw error(404, "Shared note not found");
		return {
			note,
			folder: "shared" as const
		};
	}

	throw error(404, `Folder "${folder}" does not exist`);
};
