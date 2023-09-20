<script lang="ts">
	import { page } from "$app/stores";
	import { supabase } from "$lib/supabase/client";
	import { derived } from "svelte/store";

	export let parent: any;

	const session = derived(page, ($page) => $page.data.session);

	const searchParams = new URLSearchParams({
		redirect: $page.route.id ?? "/"
	});

	const auth = supabase.auth;

	const handleGoogleSignIn = async () => {
		await auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${
					$page.url.origin
				}/auth/callback?${searchParams.toString()}`
			}
		});
	};

	$: {
		if (!!$session) parent.onClose();
	}
</script>

<div
	class="rounded bg-surface-100-800-token w-modal h-48 grid place-content-center gap-6"
>
	<h2 class="h2">Please sign in to continue</h2>

	<button class="btn variant-filled" on:click={handleGoogleSignIn}>
		Sign in with Google
	</button>
</div>
