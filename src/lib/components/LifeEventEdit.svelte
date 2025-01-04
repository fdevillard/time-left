<script lang="ts">
	import { DateTime } from 'luxon';
	import type { LifeEvent } from '$lib/models';
	import { v4 as uuidv4 } from 'uuid';

	interface Props {
		lifeEvents: LifeEvent[];
		onEventChanged: (changed: LifeEvent) => void;
		onEventDeleted: (id: LifeEvent['id']) => void;
	}

	let { lifeEvents, onEventChanged, onEventDeleted }: Props = $props();

	function randomColor() {
		return '#' + Math.floor(Math.random() * 16777215).toString(16);
	}

	function addLifeEvent() {
		onEventChanged({
			id: uuidv4(),
			title: '',
			date: DateTime.now(),
			color: randomColor()
		});
	}

	function updateLifeEvent(index: number, field: keyof LifeEvent, event: Event) {
		const target = event.target as HTMLInputElement;
		let updatedEvent: Partial<LifeEvent> = {};
		switch (field) {
			case 'date':
				if (target) {
					updatedEvent[field] = DateTime.fromISO(target.value);
				}
				break;
			default:
				if (target) {
					updatedEvent[field] = target.value || '';
				}
				break;
		}

		if (updatedEvent) {
			const event = { ...lifeEvents[index], ...updatedEvent };
			onEventChanged(event);
		}
	}

	function removeLifeEvent(index: number) {
		const id = lifeEvents[index]?.id;
		if (id) {
			onEventDeleted(id);
		}
	}
</script>

<div>
	{#each lifeEvents as event, index}
		<div class="life-event">
			<input
				type="text"
				value={event.title}
				placeholder="Title"
				oninput={(e) => updateLifeEvent(index, 'title', e)}
			/>
			<input
				type="date"
				value={event.date.toISODate()}
				oninput={(e) => updateLifeEvent(index, 'date', e)}
			/>
			<button onclick={() => removeLifeEvent(index)}>Remove</button>
		</div>
	{/each}
	<button onclick={addLifeEvent}>Add Life Event</button>
</div>

<style>
	.life-event {
		margin: 0.5em 0;
	}
</style>
