<script lang="ts">
	import { page } from "$app/stores";
</script>

<section class="container grid place-items-center gap-2">
	<h1 class="h1">{$page.status}</h1>
	<p class="p">{$page.error?.message}</p>

	<a class="btn variant-filled-surface" href="/local">
		Go back to local notes
	</a>
</section>
