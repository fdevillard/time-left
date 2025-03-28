<script lang="ts">
    import type { Frequency, LifeEvent, Person } from "$lib/models";
    import { getFrequency } from "$lib/utils";

    type Props = {
        lifeEventsWithDeath: LifeEvent[];
        people: Person[];
        frequencies: Frequency[];

        onFrequencyUpdate: (updated: Frequency) => void;
    };

    let { lifeEventsWithDeath, people, frequencies, onFrequencyUpdate }: Props = $props();

    function createInputCallback(person: Person, event: LifeEvent): (e: Event) => void {
        return (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target) {
                const value = +target.value;
                const frequency = Math.max(0, Math.min(7, value));
                onFrequencyUpdate({
                    personId: person.id,
                    beforeEventKey: event.id,
                    frequency: frequency
                });
            }
        };
    }
</script>

<table>
    <thead>
        <tr>
            <th>Person</th>
            {#each lifeEventsWithDeath as event}
                <th>Before {event.title}</th>
            {/each}
        </tr>
    </thead>

    <tbody>
        {#snippet frequencyItem(person: Person, lifeEvent: LifeEvent)}
            <td>
                <input
                    type="number"
                    value={getFrequency(frequencies, person.id, lifeEvent.id)}
                    oninput={createInputCallback(person, lifeEvent)}
                    max="7"
                    min="0"
                />
            </td>
        {/snippet}
        {#each people as person}
            <tr>
                <th>{person.name}</th>
                {#each lifeEventsWithDeath as lifeEvent}
                    {@render frequencyItem(person, lifeEvent)}
                {/each}
            </tr>
        {/each}
    </tbody>
</table>

<style>
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        text-align: center;
    }

    th,
    td {
        padding: 15px;
        border: 1px solid #ddd;
        vertical-align: middle;
    }
</style>
