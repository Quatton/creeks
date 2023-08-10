<script lang="ts">
	import { sessions } from "$lib/stores/core";
	import {
		Table,
		tableMapperValues,
		type TableSource
	} from "@skeletonlabs/skeleton";

	const sessionTable: TableSource = {
		head: ["Created At", "Title", "Content"],
		body: tableMapperValues($sessions, ["createdAt", "title", "content"])
	};
</script>

<svelte:head>
	<title>Notes</title>
	<meta name="description" content="Your saved notes" />
</svelte:head>

<section>
	<Table source={sessionTable} interactive />
</section>
