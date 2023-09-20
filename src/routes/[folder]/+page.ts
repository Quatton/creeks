import { error, redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const prerender = true;

export const load: PageLoad = async ({ params }) => {
	const { folder } = params;

	// folder === "local" or "shared" only

	if (!["local", "shared"].includes(folder)) {
		throw error(404, `Folder "${folder}" does not exist`);
	}
};
