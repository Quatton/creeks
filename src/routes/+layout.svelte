<script>
	// import "../theme.postcss";

	import "@skeletonlabs/skeleton/styles/skeleton.css";

	import "@skeletonlabs/skeleton/themes/theme-gold-nouveau.css";

	import "../app.postcss";
	import Header from "./Header.svelte";
	import Footer from "./Footer.svelte";
	import { AppShell, Modal } from "@skeletonlabs/skeleton";
	import { cn } from "$lib/utils/cn";

	import { setModeCurrent } from "@skeletonlabs/skeleton";
	import { onMount } from "svelte";

	onMount(() => {
		const time = new Date().getHours();

		if (time >= 6 && time < 12) {
			setModeCurrent(true);
		} else if (time >= 12 && time < 18) {
			setModeCurrent(false);
		} else {
			setModeCurrent(false);
		}
	});
</script>

<Modal />
<AppShell slotPageContent="grid place-items-center">
	<svelte:fragment slot="header">
		<Header />
	</svelte:fragment>

	<slot />

	<svelte:fragment slot="pageFooter">
		<Footer />
	</svelte:fragment>
</AppShell>
