import { DateTime } from "luxon";

export type Person = {
    id: string;
    name: string;
    birthDate: DateTime;
};

export type LifeEvent = {
    id: string;
    title: string;
    date: DateTime;
    color: string;
};

export type BeforeEventKey = LifeEvent["id"] | "death";

export type Frequency = {
    personId: Person["id"];
    beforeEventKey: BeforeEventKey;
    frequency: number;
};

export type Frequencies = Frequency[];

export type Result = {
    person: Person;
    consumedRatio: number;
};
export type GridEvent = {
    event: "user_born" | "user_death" | "life_event";
};

export type Cell = {
    context: "user-alive" | "user-not-alive";
    events: GridEvent[];
    duringUserYear: number;
    week: number;
};

export type Grid = {
    cells: Cell[][];
    width: number;
    height: number;
};
