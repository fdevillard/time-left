<script lang="ts">
	import type { Person } from '$lib/models';
	import { DateTime } from 'luxon';
	import { v4 as uuidv4 } from 'uuid';

	type Props = {
		people: Person[];
		onPersonChanged: (changed: Person) => void;
		onPersonDeleted: (id: Person['id']) => void;
	};

	let { people, onPersonChanged, onPersonDeleted }: Props = $props();

	function editPerson(index: number, field: keyof Person, event: Event) {
		const target = event.target as HTMLInputElement;
		let updatedPerson: Partial<Person> = {};
		switch (field) {
			case 'birthDate':
				if (target) {
					updatedPerson[field] = DateTime.fromISO(target.value);
				}
				break;
			default:
				if (target) {
					updatedPerson[field] = target.value || '';
				}
				break;
		}

		if (updatedPerson) {
			const person = { ...people[index], ...updatedPerson };
			onPersonChanged(person);
		}
	}

	function addPerson() {
		onPersonChanged({ id: uuidv4(), name: '', birthDate: DateTime.now() });
	}
</script>

<div>
	{#each people as person, index}
		<div class="person">
			<input
				type="text"
				placeholder="Name"
				value={person.name}
				oninput={(event) => editPerson(index, 'name', event)}
			/>
			<input
				type="date"
				placeholder="Birthdate"
				value={person.birthDate?.toISODate()}
				oninput={(event) => editPerson(index, 'birthDate', event)}
			/>
			<button type="button" onclick={() => onPersonDeleted(person.id)}>Delete</button>
		</div>
	{/each}
	<button type="button" onclick={() => addPerson()}>Add Person</button>
</div>

<style>
	.person {
		margin: 0.5em 0;
	}
</style>
