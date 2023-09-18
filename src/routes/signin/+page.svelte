<script lang="ts">
	import { page } from "$app/stores";
	import type { PageData } from "../account/$types";

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

<button class="btn variant-filled" on:click={handleGoogleSignIn}>
	Sign in with Google
</button>
