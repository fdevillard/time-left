import type { DateTime } from 'luxon';
import type { Frequencies, Frequency, LifeEvent, Person } from './models';

export function getFrequency(
	frequencies: Frequencies,
	personId: Person['id'],
	lifeEventId: LifeEvent['id']
): Frequency['frequency'] {
	const frequency = frequencies.find(
		(f) => f.personId === personId && f.beforeEventKey === lifeEventId
	);
	if (frequency) {
		return frequency.frequency;
	}

	const lastestForUser = frequencies.findLast((f) => f.personId === personId);
	if (lastestForUser) {
		return lastestForUser.frequency;
	}

	return 0;
}

export type WeekStat = {
	passedWeeks: number;
	remainingWeeks: number;
};

export function getWeekState(now: DateTime, startPeriod: DateTime, endPeriod: DateTime): WeekStat {
	if (startPeriod > endPeriod) {
		return { passedWeeks: 0, remainingWeeks: 0 };
	}

	const periodLength = Math.floor(endPeriod.diff(startPeriod, 'weeks').weeks);
	if (now < startPeriod) {
		return { passedWeeks: 0, remainingWeeks: periodLength };
	}
	if (now > endPeriod) {
		return { passedWeeks: periodLength, remainingWeeks: 0 };
	}
	const passedWeeks = Math.floor(now.diff(startPeriod, 'weeks').weeks);
	const remainingWeeks = Math.ceil(endPeriod.diff(now, 'weeks').weeks);
	return { passedWeeks, remainingWeeks };
}

export function personExpectedDeath(person: Person): DateTime {
	const age = Math.ceil(person.birthDate.diffNow('years').years);
	const lifeExpectancy = Math.max(85, age + 5);
	return person.birthDate.plus({ years: lifeExpectancy });
}
