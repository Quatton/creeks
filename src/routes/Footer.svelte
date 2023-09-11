<script>
	import IconBookMarked from "~icons/lucide/book-marked";
	import IconPenSquare from "~icons/lucide/pen-square";
	import { page } from "$app/stores";

	const links = [
		{
			href: "/notes",
			Icon: IconBookMarked
		},
		{
			href: "/new",
			Icon: IconPenSquare
		}
	];
</script>

<footer class="flex justify-between">
	{#each links as { href, Icon }}
		<a
			class="btn-icon w-12 h-12 flex items-center justify-center {$page.url
				.pathname === href
				? 'cursor-not-allowed text-slate-500'
				: 'btn'}"
			{href}
		>
			<Icon class="w-8 h-8" />
		</a>
	{/each}
</footer>
