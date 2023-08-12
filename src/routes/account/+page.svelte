<script lang="ts">
	import { page } from "$app/stores";
	import type { PageData } from "./$types";

	export let data: PageData;
	let { supabase, session } = data;
	$: ({ supabase } = data);

	const auth = supabase.auth;

	const handleGoogleSignIn = async () => {
		await auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: $page.url.origin + "/auth/callback"
			}
		});
	};

	const handleSignOut = async () => {
		await auth.signOut();
	};
</script>

{#if !session}
	<button class="btn variant-filled" on:click={handleGoogleSignIn}>
		Sign in with Google
	</button>
{:else}
	<h1>Welcome, {session.user.user_metadata.name}</h1>
	<button class="btn variant-soft" on:click={handleSignOut}> Sign out </button>
{/if}
