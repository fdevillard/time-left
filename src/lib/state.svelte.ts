import { DateTime } from 'luxon';
import type { Frequencies, Frequency, LifeEvent, Person } from './models';

type LocalStorage = WindowLocalStorage['localStorage'];

type SerializedPerson = Omit<Person, 'birthDate'> & { birthDate: string };
type SerializedLifeEvent = Omit<LifeEvent, 'date'> & { date: string };

export class State {
	birthDate: DateTime | null = $state(null);
	relatives: Person[] = $state([]);
	lifeEvents: LifeEvent[] = $state([]);
	frequencies: Frequencies = $state([]);

	lifeExpectancy: number = $derived.by(() => {
		const birthDate = this.birthDate;
		if (!birthDate) {
			return 85;
		}

		const age = Math.round(Math.abs(birthDate.diffNow('years').years));
		return Math.max(85, age + 5);
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
			(f) => f.personId === frequency.personId && f.beforeEventKey === frequency.beforeEventKey
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
		const state = localStorage.getItem('state');
		if (!state) {
			return new State();
		}

		const { birthDate, relatives, lifeEvents, frequencies } = JSON.parse(state);
		const birthDateParsed = birthDate ? DateTime.fromISO(birthDate) : null;
		const relativesParsed = relatives
			? relatives.map((r: SerializedPerson) => ({ ...r, birthDate: DateTime.fromISO(r.birthDate) }))
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
		localStorage.setItem('state', JSON.stringify(state));
	}
}
