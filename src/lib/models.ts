import { DateTime } from 'luxon';

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

export type BeforeEventKey = LifeEvent['id'] | 'death';

export type Frequency = {
	personId: Person['id'];
	beforeEventKey: BeforeEventKey;
	frequency: number;
};

export type Frequencies = Frequency[];
