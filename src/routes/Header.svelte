<script>
	import logo from "$lib/images/memoiz.svg";
	import darkLogo from "$lib/images/memoiz-dark.svg";
	import LucideUserCircle2 from "~icons/lucide/user-circle-2";
	import { modeCurrent } from "@skeletonlabs/skeleton";
	import { page } from "$app/stores";
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
			class="btn-icon w-12 h-12 flex items-center justify-center"
			href="/account"
		>
			<LucideUserCircle2 class="w-8 h-8" />
		</a>
	</div>
</header>
