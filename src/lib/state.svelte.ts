import { DateTime } from 'luxon';
import type { LifeEvent, Person } from './models';

type LocalStorage = WindowLocalStorage['localStorage'];

type SerializedPerson = Omit<Person, 'birthDate'> & { birthDate: string };
type SerializedLifeEvent = Omit<LifeEvent, 'date'> & { date: string };

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

	static fromLocalStorage(localStorage: LocalStorage): State {
		const state = localStorage.getItem('state');
		if (!state) {
			return new State();
		}

		const { birthDate, relatives, lifeEvents } = JSON.parse(state);
		const birthDateParsed = birthDate ? DateTime.fromISO(birthDate) : null;
		const relativesParsed = relatives
			? relatives.map((r: SerializedPerson) => ({ ...r, birthDate: DateTime.fromISO(r.birthDate) }))
			: [];
		const lifeEventsParsed = lifeEvents
			? lifeEvents.map((e: SerializedLifeEvent) => ({ ...e, date: DateTime.fromISO(e.date) }))
			: [];

		return new State(birthDateParsed, relativesParsed, lifeEventsParsed);
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
