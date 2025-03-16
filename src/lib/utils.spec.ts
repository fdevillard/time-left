import { DateTime } from "luxon";
import { describe, it, expect } from "vitest";
import { getWeekState } from "./utils";

describe("getWeekState", () => {
    it("a period in the past should only have passed count", () => {
        // Arrange
        const now = DateTime.fromISO("2021-01-01");
        const startPeriod = DateTime.fromISO("2020-01-01");
        const endPeriod = DateTime.fromISO("2020-12-31");

        // Act
        const result = getWeekState(now, startPeriod, endPeriod);

        // Assert
        expect(result).toEqual({ passedWeeks: 52, remainingWeeks: 0 });
    });

    it("a period in the future should only have remaining count", () => {
        // Arrange
        const now = DateTime.fromISO("2021-01-01");
        const startPeriod = DateTime.fromISO("2022-01-01");
        const endPeriod = DateTime.fromISO("2022-12-31");

        // Act
        const result = getWeekState(now, startPeriod, endPeriod);

        // Assert
        expect(result).toEqual({ passedWeeks: 0, remainingWeeks: 52 });
    });

    it("a period in the present should have passed and remaining count", () => {
        // Arrange
        const now = DateTime.fromISO("2021-07-01");
        const startPeriod = DateTime.fromISO("2021-01-01");
        const endPeriod = DateTime.fromISO("2021-12-31");

        // Act
        const result = getWeekState(now, startPeriod, endPeriod);

        // Assert
        expect(result).toEqual({ passedWeeks: 25, remainingWeeks: 27 });
    });

    it("should return 0 if startPeriod is greater than endPeriod", () => {
        // Arrange
        const now = DateTime.fromISO("2021-07-01");
        const startPeriod = DateTime.fromISO("2021-12-31");
        const endPeriod = DateTime.fromISO("2021-01-01");

        // Act
        const result = getWeekState(now, startPeriod, endPeriod);

        // Assert
        expect(result).toEqual({ passedWeeks: 0, remainingWeeks: 0 });
    });
});
