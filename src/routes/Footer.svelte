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
			href: "/",
			Icon: IconPenSquare
		}
	];
</script>

<footer class="flex justify-between">
	{#each links as { href, Icon }}
		<a
			class="btn-icon {$page.url.pathname === href
				? 'cursor-not-allowed text-slate-500'
				: 'btn'}"
			{href}
		>
			<Icon />
		</a>
	{/each}
</footer>
