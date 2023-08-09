<script>
	import logo from "$lib/images/svelte-logo.svg";
	import github from "$lib/images/github.svg";
</script>

<header class="flex justify-between">
	<div class="w-12 h-12">
		<a
			href="https://kit.svelte.dev"
			class="flex items-center justify-center w-full h-full"
		>
			<img src={logo} alt="SvelteKit" class="w-8 h-8 object-contain" />
		</a>
	</div>

	<div class="w-12 h-12">
		<a
			href="https://github.com/sveltejs/kit"
			class="flex items-center justify-center w-full h-full"
		>
			<img src={github} alt="GitHub" class="w-8 h-8 object-contain" />
		</a>
	</div>
</header>
