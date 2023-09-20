import { sessions } from "$lib/stores/core";
import { error } from "@sveltejs/kit";
import { get } from "svelte/store";
import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabase/client";

export const ssr = false;

export const load: PageLoad = async ({ params }) => {
	const noteId = params.id;
	const folder = params.folder;

	if (folder === "local") {
		const gotSessions = get(sessions);
		const note = gotSessions.find((session) => session.id === noteId);
		if (!note) throw error(404, "Local note not found");

		return {
			note,
			folder: "local" as const
		};
	}

	if (folder === "shared") {
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
