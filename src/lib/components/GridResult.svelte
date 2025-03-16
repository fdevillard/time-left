<script lang="ts">
    import type { Cell, Grid } from "$lib/models";
    import { onMount } from "svelte";
    import { createPopperActions } from "svelte-popperjs";
    import CellDetail from "./CellDetail.svelte";

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

    let popperDiv: HTMLDivElement | undefined = $state(undefined);
    let popperCell: Cell | undefined = $state(undefined);

    const [popperRef, popperContent] = createPopperActions();

    function handleClickOutisde(e: MouseEvent) {
        if (popperCell && popperDiv && e.target && !popperDiv?.contains(e.target as Node)) {
            popperCell = undefined;
        }
    }

    onMount(() => {
        document.addEventListener("click", handleClickOutisde);
        return () => {
            document.removeEventListener("click", handleClickOutisde);
        };
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
                        <button
                            onclick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                popperCell = cell;
                                popperRef(e.currentTarget);
                            }}
                            aria-label="display week details"
                        ></button>
                    </td>
                {/each}
            </tr>
        {/each}
    </tbody>
</table>
{#if popperCell}
    <div use:popperContent class="popper" bind:this={popperDiv}>
        <CellDetail cell={popperCell} />
    </div>
{/if}

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

    td > button {
        all: unset;
        display: block;
        background: none;
        border: none;
        padding: 0;
        margin: 0;
        font: inherit;
        color: inherit;
        cursor: pointer;

        background-color: lightgray;
        width: 100%;
        height: 100%;
        border-radius: 20%;
    }

    td.birth > button {
        background-color: lightcoral;
    }

    td.death > button {
        background-color: lightcoral;
    }

    td.life-event > button {
        background-color: rgb(0, 255, 4);
    }

    td.not-alive > button {
        opacity: 0.3;
    }

    td > button:hover {
        background-color: grey;
    }

    .popper {
        min-width: 5em;
        min-height: 1em;

        z-index: 1000;
        overflow: auto;

        /* Display popper div backend in white and dark mode along with visible text */
        background-color: rgb(193, 192, 192);
        padding: 0.5em 1em;
        border-radius: 0.5em;

        @media (prefers-color-scheme: dark) {
            background-color: rgb(130, 129, 129);
            color: white;
        }
    }
</style>
