import { DateTime } from "luxon";
import { describe, it, expect } from "vitest";
import { State } from "./state.svelte";
import { LIFE_EXPECTANCY } from "./utils";

describe("state", () => {
    it("a relative dying during lifetime should only be counted until death", () => {
        const now = DateTime.utc(2020, 1, 1);
        const s = new State(
            DateTime.utc(1980, 1, 1),
            [{ id: "dying-at-5", name: "any", birthDate: DateTime.utc(1980 - 80, 1, 1) }],
            [],
            [{ personId: "dying-at-5", beforeEventKey: "death", frequency: 1 }]
        );
        s.now = now;

        // Act
        const result = s.results;

        // Assert
        expect(result).toEqual([{ person: s.relatives[0], consumedRatio: 1 }]);
    });

    it("a relative born after now should have a consumed ratio of 0", () => {
        const now = DateTime.utc(2020, 1, 1);
        const s = new State(
            DateTime.utc(1980, 1, 1),
            [{ id: "born-in-2021", name: "any", birthDate: DateTime.utc(2021, 1, 1) }],
            [],
            []
        );
        s.now = now;

        // Act
        const result = s.results;

        // Assert
        expect(result).toEqual([{ person: s.relatives[0], consumedRatio: 0 }]);
    });

    it("compute correctly the case where people start living together", () => {
        const now = DateTime.utc(2020, 1, 1);
        const s = new State(
            DateTime.utc(1980, 1, 1),
            [{ id: "related", name: "any", birthDate: DateTime.utc(1980, 1, 1) }],
            [{ id: "moving-in", title: "moving in", date: DateTime.utc(2019, 1, 1), color: "red" }],
            [{ personId: "related", beforeEventKey: "death", frequency: 7 }]
        );
        s.now = now;

        // Act
        const result = s.results;

        const remainingYears = 1980 + LIFE_EXPECTANCY - 2020;
        const expectedConsumedRatio = (2020 - 2019) / remainingYears;

        // Assert
        expect(result).toHaveLength(1);
        const person = result[0].person;
        const consumedRatio = result[0].consumedRatio;

        expect(person.id).toEqual("related");
        expect(consumedRatio).toBeCloseTo(expectedConsumedRatio);
    });

    it("compute the grid correctly", () => {
        const now = DateTime.utc(2020, 1, 1);
        const moveInDate = DateTime.utc(2019, 1, 1);
        const s = new State(
            DateTime.utc(1980, 2, 1),
            [{ id: "related", name: "any", birthDate: DateTime.utc(1980, 1, 1) }],
            [{ id: "moving-in", title: "moving in", date: moveInDate, color: "red" }],
            [{ personId: "related", beforeEventKey: "death", frequency: 7 }]
        );
        s.now = now;

        // Act
        const grid = s.resultsAsGrid;

        // Assert
        const width = 52;
        const height = LIFE_EXPECTANCY + 1;
        expect(grid.height).toEqual(height);
        for (const row of grid.cells) {
            expect(row).toHaveLength(width);
        }

        expect(grid.cells[0][4].events).toEqual([{ event: "user_born" }]);
        expect(grid.cells[0][4].context).toEqual("user-alive");
        expect(grid.cells[39][0].events).toEqual([{ event: "life_event" }]);
        expect(grid.cells[39][0].context).toEqual("user-alive");
        expect(grid.cells[LIFE_EXPECTANCY][4].events).toEqual([{ event: "user_death" }]);
        expect(grid.cells[LIFE_EXPECTANCY][4].context).toEqual("user-not-alive");
    });
});
