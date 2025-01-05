<script lang="ts">
	import type { Result } from '$lib/models';

	type Props = {
		results: Result[];
	};

	let { results }: Props = $props();
</script>

<div>
	<h3>Remaining time:</h3>
	<ul>
		{#each results as result}
			<li>{result.consumedRatio} of the time already spent with {result.person.name}</li>
		{/each}
	</ul>
</div>
