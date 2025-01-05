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
