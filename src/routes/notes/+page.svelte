<script lang="ts">
	import { sessions } from "$lib/stores/core";
	import {
		Table,
		tableMapperValues,
		type TableSource
	} from "@skeletonlabs/skeleton";
	import { derived } from "svelte/store";
	import { format } from "date-fns";

	const convertedSessions = derived(sessions, ($sessions) => {
		if (!$sessions) return [];
		return $sessions.map((session) => {
			return {
				...session,
				// Wed, 21 Jul 2021 00:00
				createdAt: format(new Date(session.createdAt), "ccc, dd MMM yyyy HH:mm")
			};
		});
	});

	const sessionTable: TableSource = {
		head: ["Title", "Content", "Created At"],
		body: tableMapperValues($convertedSessions, [
			"title",
			"content",
			"createdAt"
		]),
		meta: tableMapperValues($convertedSessions, ["id"])
	};
</script>

<svelte:head>
	<title>Notes</title>
	<meta name="description" content="Your saved notes" />
</svelte:head>

<section class="container self-start">
	<Table source={sessionTable} interactive />
</section>
