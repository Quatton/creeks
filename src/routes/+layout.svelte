<script>
	import "@skeletonlabs/skeleton/styles/skeleton.css";

	import "@skeletonlabs/skeleton/themes/theme-gold-nouveau.css";

	import "../app.postcss";
	import Header from "./Header.svelte";
	import Footer from "./Footer.svelte";
	import { AppShell, Modal } from "@skeletonlabs/skeleton";
	import { cn } from "$lib/utils/cn";
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
