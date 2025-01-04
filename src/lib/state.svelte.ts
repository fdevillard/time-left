import { DateTime } from 'luxon';
import type { LifeEvent, Person } from './models';

type LocalStorage = WindowLocalStorage['localStorage'];

export class State {
	birthDate: DateTime | null = $state(null);
	relatives: Person[] = $state([]);
	lifeEvents: LifeEvent[] = $state([]);

	lifeExpectancy: number = $derived.by(() => {
		const birthDate = this.birthDate;
		if (!birthDate) {
			return 85;
		}

		const age = Math.round(Math.abs(birthDate.diffNow('years').years));
		return Math.max(85, age + 5);
	});

	constructor(birthDate?: DateTime | null, relatives?: Person[], lifeEvents?: LifeEvent[]) {
		if (birthDate) {
			this.birthDate = birthDate;
		}
		if (relatives) {
			this.relatives = relatives;
		}
		if (lifeEvents) {
			this.lifeEvents = lifeEvents;
		}
	}

	static fromLocalStorage(localStorage: LocalStorage): State {
		const state = localStorage.getItem('state');
		if (!state) {
			return new State();
		}

		const { birthDate, relatives, lifeEvents } = JSON.parse(state);
		return new State(birthDate ? DateTime.fromISO(birthDate) : null, relatives, lifeEvents);
	}

	static save(
		localStorage: LocalStorage,
		birthDate: DateTime | null,
		relatives: Person[],
		lifeEvents: LifeEvent[]
	) {
		const state = { birthDate, relatives, lifeEvents };
		localStorage.setItem('state', JSON.stringify(state));
	}
}
