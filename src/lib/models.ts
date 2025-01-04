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
	description: string;
	color: string;
};
