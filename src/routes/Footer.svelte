<script>
	import IconBookMarked from "~icons/lucide/book-marked";
	import IconPenSquare from "~icons/lucide/pen-square";
	import { page } from "$app/stores";
</script>

<footer class="flex justify-between">
	<a
		class="btn-icon {$page.url.pathname === '/notes'
			? 'cursor-not-allowed text-slate-500'
			: 'btn'}"
		href="/notes"
	>
		<IconBookMarked />
	</a>
	<a
		class="btn-icon {$page.url.pathname === '/'
			? 'cursor-not-allowed text-slate-500'
			: 'btn'}"
		href="/"
	>
		<IconPenSquare />
	</a>
</footer>
