<script lang="ts">
    import type { Cell, Grid } from "$lib/models";

    type Props = {
        grid: Grid;
    };

    let { grid }: Props = $props();

    function classForCell(cell: Cell): string {
        if (cell.events.some((e) => e.event === "user_born")) {
            return "birth";
        }

        if (cell.events.some((e) => e.event === "user_death")) {
            return "death";
        }

        if (cell.events.some((e) => e.event === "life_event")) {
            return "life-event";
        }

        if (cell.context === "user-not-alive") {
            return "not-alive";
        }

        return "";
    }
    const aggregatedHeaders = 5;
    let headers: Array<number> = $state([]);

    $effect(() => {
        headers = [...Array(grid.width).keys()].filter(
            (week) => (week + 1) % aggregatedHeaders == 0
        );
    });
</script>

<table>
    <thead>
        <tr>
            {#each headers as week}
                <th colspan={aggregatedHeaders}>
                    {#if (week + 1) % 5 == 0}
                        {week + 1}
                    {/if}
                </th>
            {/each}
        </tr>
    </thead><tbody>
        {#each grid.cells as year}
            <tr>
                {#each year as cell}
                    <td class={classForCell(cell)}>
                        <div></div>
                    </td>
                {/each}
            </tr>
        {/each}
    </tbody>
</table>

<style>
    table {
        table-layout: fixed;
        border-collapse: collapse;
        width: 100%;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
    }

    th {
        text-align: right;
        font-size: x-small;
        color: gray;
    }

    td {
        width: calc(100% / 54);
        height: 5px;
    }

    td > div {
        background-color: lightgray;
        width: 100%;
        height: 100%;
        border-radius: 20%;
    }

    td.birth > div {
        background-color: lightcoral;
    }

    td.death > div {
        background-color: lightcoral;
    }

    td.life-event > div {
        background-color: rgb(0, 255, 4);
    }

    td.not-alive > div {
        opacity: 0.3;
    }
</style>
