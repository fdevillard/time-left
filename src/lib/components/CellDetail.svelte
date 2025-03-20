<script lang="ts">
    import type { Cell } from "$lib/models";

    type Props = {
        cell: Cell;
    };

    let { cell }: Props = $props();

    function humanizeYear(year: number): string {
        if (!year) {
            return "first year";
        }

        return `year ${year}`;
    }

    function getTitle(cell: Cell): string {
        if (cell.events.some((e) => e.event === "user_born")) {
            return "You're starting your life";
        }

        if (cell.events.some((e) => e.event === "user_death")) {
            return "We think you're likely to die here.";
        }

        if (cell.events.some((e) => e.event === "life_event")) {
            return `Life Event happened during the week ${cell.week} of your ${humanizeYear(cell.duringUserYear)}`;
        }

        return `Not many things happened during the week ${cell.week} of your ${humanizeYear(cell.duringUserYear)}`;
    }
</script>

<div>
    <p>{getTitle(cell)}</p>

    {#if cell.events.length > 0}
        <p>{cell.events.length} events</p>
    {/if}
</div>
