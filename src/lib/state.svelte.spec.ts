import { DateTime } from 'luxon';
import { describe, it, expect } from 'vitest';
import { State } from './state.svelte';

describe('state', () => {
	it('a relative dying during lifetime should only be counted until death', () => {
		const now = DateTime.utc(2020, 1, 1);
		const s = new State(
			DateTime.utc(1980, 1, 1),
			[{ id: 'dying-at-5', name: 'any', birthDate: DateTime.utc(1980 - 80, 1, 1) }],
			[],
			[{ personId: 'dying-at-5', beforeEventKey: 'death', frequency: 1 }]
		);
		s.now = now;

		// Act
		const result = s.results;

		// Assert
		expect(result).toEqual([{ person: s.relatives[0], consumedRatio: 1 }]);
	});

	it('a relative born after now should have a consumed ratio of 0', () => {
		const now = DateTime.utc(2020, 1, 1);
		const s = new State(
			DateTime.utc(1980, 1, 1),
			[{ id: 'born-in-2021', name: 'any', birthDate: DateTime.utc(2021, 1, 1) }],
			[],
			[]
		);
		s.now = now;

		// Act
		const result = s.results;

		// Assert
		expect(result).toEqual([{ person: s.relatives[0], consumedRatio: 0 }]);
	});
});
