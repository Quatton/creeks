<script>
	// import "../theme.postcss";

	import "../app.postcss";
	import Header from "./Header.svelte";
	import Footer from "./Footer.svelte";
	import { AppShell, Modal, Toast } from "@skeletonlabs/skeleton";
	import { cn } from "$lib/utils/cn";

	import { setModeCurrent } from "@skeletonlabs/skeleton";
	import { onMount } from "svelte";

	import { invalidate } from "$app/navigation";

	/** Skeleton Popup*/
	import {
		computePosition,
		autoUpdate,
		offset,
		shift,
		flip,
		arrow
	} from "@floating-ui/dom";

	import { storePopup } from "@skeletonlabs/skeleton";
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	export let data;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	onMount(() => {
		const time = new Date().getHours();

		if (time >= 6 && time < 12) {
			setModeCurrent(true);
		} else if (time >= 12 && time < 18) {
			setModeCurrent(false);
		} else {
			setModeCurrent(false);
		}

		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate("supabase:auth");
			}
		});

		return () => subscription.unsubscribe();
	});

	import { initializeStores } from "@skeletonlabs/skeleton";

	initializeStores();
</script>

<Modal />
<Toast />
<AppShell
	slotPageContent="flex items-center justify-center overflow-hidden shrink-1"
>
	<svelte:fragment slot="header">
		<Header />
	</svelte:fragment>

	<slot />

	<svelte:fragment slot="footer">
		<Footer />
	</svelte:fragment>
</AppShell>
