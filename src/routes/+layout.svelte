<script>
	import "@skeletonlabs/skeleton/styles/skeleton.css";

	import "@skeletonlabs/skeleton/themes/theme-gold-nouveau.css";

	import "../app.postcss";
	import Header from "./Header.svelte";
	import Footer from "./Footer.svelte";
</script>

<div class="flex flex-col" style="height: 100svh">
	<Header />

	<main class="flex-1 grid place-content-center">
		<slot />
	</main>

	<Footer />
</div>
