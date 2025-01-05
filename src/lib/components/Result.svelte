<script lang="ts">
	import type { Result } from '$lib/models';

	type Props = {
		results: Result[];
	};

	let { results }: Props = $props();

	function format(result: Result): string {
		const percentage = Number(result.consumedRatio).toLocaleString(undefined, { style: 'percent' });
		if (result.consumedRatio < 0.5) {
			return `You have only spent ${percentage} of your time with ${result.person.name}`;
		}
		if (result.consumedRatio < 0.8) {
			return `You have spent slightly more than the half of your time with ${result.person.name} (${percentage})`;
		}

		return `${percentage} of the time already spent with ${result.person.name}`;
	}
</script>

<div>
	<h3>Remaining time:</h3>
	<ul>
		{#each results as result}
			<li>{format(result)}</li>
		{/each}
	</ul>
</div>
