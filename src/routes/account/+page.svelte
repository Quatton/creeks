<script lang="ts">
	import { page } from "$app/stores";
	import type { PageData } from "../account/$types";

	export let data: PageData;
	let { supabase, session } = data;
	$: ({ supabase } = data);

	const auth = supabase.auth;

	const handleSignOut = async () => {
		await auth.signOut();
	};
</script>

<h1>Welcome, {session.user.user_metadata.name}</h1>
<button class="btn variant-soft" on:click={handleSignOut}> Sign out </button>
