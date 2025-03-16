import { DateTime } from "luxon";
import type { Cell, Frequencies, Frequency, Grid, LifeEvent, Person, Result } from "./models";
import { getFrequency, getWeekState, LIFE_EXPECTANCY, personExpectedDeath } from "./utils";

type LocalStorage = WindowLocalStorage["localStorage"];

type SerializedPerson = Omit<Person, "birthDate"> & { birthDate: string };
type SerializedLifeEvent = Omit<LifeEvent, "date"> & { date: string };

export class State {
    now: DateTime = $state(DateTime.now());
    birthDate: DateTime | null = $state(null);
    relatives: Person[] = $state([]);
    lifeEvents: LifeEvent[] = $state([]);
    frequencies: Frequencies = $state([]);

    lifeExpectancy: number = $derived.by(() => {
        const birthDate = this.birthDate;
        if (!birthDate) {
            return LIFE_EXPECTANCY;
        }

        const age = Math.round(Math.abs(birthDate.diff(this.now, "years").years));
        return Math.max(LIFE_EXPECTANCY, age + 5);
    });

    expectedDeath: DateTime = $derived.by(() => {
        const birthDate = this.birthDate;
        if (!birthDate) {
            return this.now;
        }

        return birthDate.plus({ years: this.lifeExpectancy });
    });

    eventsWithDeath: LifeEvent[] = $derived.by(() => {
        const birthDate = this.birthDate || DateTime.utc(0, 0, 0);
        const validEvents = this.lifeEvents.filter(
            (event) => event.date >= birthDate && event.date <= this.expectedDeath
        );
        const sorted = validEvents.sort((a, b) => a.date.toMillis() - b.date.toMillis());
        return [
            ...sorted,
            { id: "death", title: "Death", date: this.expectedDeath, color: "#000000" }
        ];
    });

    results: Result[] = $derived.by(() => {
        const results: Result[] = [];
        const now = this.now;
        this.relatives.forEach((relative) => {
            const person = relative;
            const expectedPersonDeath = personExpectedDeath(person);
            let timeSpent = 0;
            let timeRemaining = 0;
            this.eventsWithDeath.forEach((event, i) => {
                const birth = this.birthDate;
                if (!birth) {
                    throw new Error("Birth date is required");
                }
                const start = i === 0 ? birth : this.eventsWithDeath[i - 1].date;
                const end = event.date < expectedPersonDeath ? event.date : expectedPersonDeath;
                const { passedWeeks, remainingWeeks } = getWeekState(now, start, end);
                const frequency = getFrequency(this.frequencies, person.id, event.id);
                timeSpent += passedWeeks * frequency;
                timeRemaining += remainingWeeks * frequency;
            });
            const denominator = timeSpent + timeRemaining;
            const consumedRatio = denominator ? timeSpent / denominator : 0;
            results.push({ person, consumedRatio });
        });
        return results;
    });

    resultsAsGrid: Grid = $derived.by(() => {
        const width = 52;
        const birthWeek = (this.birthDate?.weekNumber || 1) - 1;
        const deathWeek = (this.expectedDeath?.weekNumber || 1) - 1;
        const cells: Grid["cells"] = [];
        let isUserAlive = false;

        // process life events
        type EventWithYearWeek = {
            year: number;
            week: number;
            event: LifeEvent;
        };
        const eventsWithYearWeek: EventWithYearWeek[] = [];
        this.lifeEvents.forEach((event) => {
            if (
                this.birthDate &&
                this.birthDate <= event.date &&
                this.expectedDeath &&
                event.date <= this.expectedDeath
            ) {
                const year = event.date.year - this.birthDate.year;
                const week = event.date.weekNumber - 1;
                eventsWithYearWeek.push({ year, week, event });
            }
        });
        console.log(eventsWithYearWeek);

        // aggregate everything in grid format
        for (let y = 0; y < LIFE_EXPECTANCY + 1; y++) {
            const row: Cell[] = [];
            for (let x = 0; x < width; x++) {
                const cellEvents: Cell["events"] = [];
                if (y === 0 && x === birthWeek) {
                    cellEvents.push({ event: "user_born" });
                    isUserAlive = true;
                }
                if (y === LIFE_EXPECTANCY && x === deathWeek) {
                    cellEvents.push({ event: "user_death" });
                    isUserAlive = false;
                }
                eventsWithYearWeek.forEach((eventWithYearWeek) => {
                    if (eventWithYearWeek.year === y && eventWithYearWeek.week === x) {
                        cellEvents.push({ event: "life_event" });
                    }
                });
                row.push({
                    context: isUserAlive ? "user-alive" : "user-not-alive",
                    events: cellEvents
                });
            }
            cells.push(row);
        }

        console.log(cells);

        return {
            cells,
            width,
            height: cells.length
        };
    });

    constructor(
        birthDate?: DateTime | null,
        relatives?: Person[],
        lifeEvents?: LifeEvent[],
        frequencies?: Frequencies
    ) {
        if (birthDate) {
            this.birthDate = birthDate;
        }
        if (relatives) {
            this.relatives = relatives;
        }
        if (lifeEvents) {
            this.lifeEvents = lifeEvents;
        }
        if (frequencies) {
            this.frequencies = frequencies;
        }
    }

    updateLifeEvent(lifeEvent: LifeEvent) {
        const index = this.lifeEvents.findIndex((e) => e.id === lifeEvent.id);
        if (index !== -1) {
            this.lifeEvents[index] = lifeEvent;
        } else {
            this.lifeEvents.push(lifeEvent);
        }
    }

    deleteLifeEvent(id: string) {
        this.lifeEvents = this.lifeEvents.filter((e) => e.id !== id);
    }

    updateRelative(relative: Person) {
        const index = this.relatives.findIndex((r) => r.id === relative.id);
        if (index !== -1) {
            this.relatives[index] = relative;
        } else {
            this.relatives.push(relative);
        }
    }

    deleteRelative(id: string) {
        this.relatives = this.relatives.filter((r) => r.id !== id);
    }

    updateFrequency(frequency: Frequency) {
        const shouldDelete = frequency.frequency === 0;
        const index = this.frequencies.findIndex(
            (f) =>
                f.personId === frequency.personId && f.beforeEventKey === frequency.beforeEventKey
        );
        if (index !== -1) {
            if (shouldDelete) {
                this.frequencies.splice(index, 1);
            } else {
                this.frequencies[index] = frequency;
            }
            this.frequencies[index] = frequency;
        } else {
            if (!shouldDelete) {
                this.frequencies.push(frequency);
            }
        }
    }

    static fromLocalStorage(localStorage: LocalStorage): State {
        const state = localStorage.getItem("state");
        if (!state) {
            return new State();
        }

        const { birthDate, relatives, lifeEvents, frequencies } = JSON.parse(state);
        const birthDateParsed = birthDate ? DateTime.fromISO(birthDate) : null;
        const relativesParsed = relatives
            ? relatives.map((r: SerializedPerson) => ({
                  ...r,
                  birthDate: DateTime.fromISO(r.birthDate)
              }))
            : [];
        const lifeEventsParsed = lifeEvents
            ? lifeEvents.map((e: SerializedLifeEvent) => ({ ...e, date: DateTime.fromISO(e.date) }))
            : [];

        const parsedFrequencies: Frequencies = frequencies || [];

        return new State(birthDateParsed, relativesParsed, lifeEventsParsed, parsedFrequencies);
    }

    static save(
        localStorage: LocalStorage,
        birthDate: DateTime | null,
        relatives: Person[],
        lifeEvents: LifeEvent[],
        frequencies: Frequencies
    ) {
        const state = { birthDate, relatives, lifeEvents, frequencies };
        localStorage.setItem("state", JSON.stringify(state));
    }
}
