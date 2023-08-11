<script>
	import logo from "$lib/images/memoiz.svg";
	import darkLogo from "$lib/images/memoiz-dark.svg";
	import github from "$lib/images/github.svg";
	import { modeCurrent } from "@skeletonlabs/skeleton";
</script>

<header class="flex justify-between">
	<div class="w-12 h-12">
		<a href="/" class="flex items-center justify-center w-full h-full">
			<img
				src={$modeCurrent ? logo : darkLogo}
				alt="SvelteKit"
				class="w-8 h-8 object-contain"
			/>
		</a>
	</div>

	<div class="w-12 h-12">
		<a
			href="https://github.com/Quatton/creeks"
			class="flex items-center justify-center w-full h-full"
		>
			<img src={github} alt="GitHub" class="w-8 h-8 object-contain" />
		</a>
	</div>
</header>
