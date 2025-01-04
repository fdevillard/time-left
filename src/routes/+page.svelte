<script lang="ts">
	import { browser } from '$app/environment';
	import { State } from '$lib/state.svelte';
	import { DateTime } from 'luxon';

	let s = browser ? State.fromLocalStorage(localStorage) : new State();

	$effect(() => {
		if (browser) {
			State.save(localStorage, s.birthDate, s.relatives, s.lifeEvents);
		}
	});

	let birthDateIso = $derived(s.birthDate ? s.birthDate.toISODate() : null);
</script>

<main>
	<h1>Time Together Calculator</h1>

	<section>
		<h2>Purpose</h2>
		<p>
			The purpose of this website is to help you reflect on the most precious resource we all have:
			<strong>time with our loved ones</strong>. By estimating the average remaining time you might
			have with your relatives, the site offers a perspective that can help you
			<strong>set your priorities right</strong> and focus on meaningful connections.
		</p>
	</section>

	<section>
		<h2>Why This Matters</h2>
		<p>
			It's easy to take the time we have for granted. By understanding what little time we may have
			left with family and friends, we can make intentional choices to:
		</p>
		<ul>
			<li>Spend more quality time together.</li>
			<li>Strengthen our relationships.</li>
			<li>Create lasting memories.</li>
		</ul>
	</section>

	<section>
		<h2>Tell Us about You</h2>
		<label for="birthdate">Birthdate:</label>
		<input
			name="birthdate"
			type="date"
			max={DateTime.now().toISO()}
			value={birthDateIso}
			onchange={(event) => {
				try {
					s.birthDate = DateTime.fromISO((event.target as HTMLInputElement)?.value);
				} catch (e) {
					console.info('Invalid date', e);
					s.birthDate = null;
				}
			}}
		/>

		<p>expectancy: {s.lifeExpectancy}</p>
	</section>

	<section>
		<h2>Life Events</h2>
		<p>
			To make the results more meaningful, think about events that impacted how often you see your
			relatives: when you moved out of your parent's place, met someone special, ended a
			relationship, lived abroad, started a new job, or had children.
		</p>
		<p>
			These turning points influence the time spent with loved ones and help provide a clearer
			picture of your shared time.
		</p>
	</section>

	<section>
		<h2>Disclaimer</h2>
		<p class="disclaimer">
			This tool is meant for <strong>reflective purposes only</strong>. All calculations are based
			on estimates and averages and are not a prediction of actual life expectancy or circumstances.
		</p>
		<p class="disclaimer">
			<strong>Data Privacy:</strong> Your data is stored locally in your browser and is never sent to
			any remote servers. This ensures your personal information remains private and secure.
		</p>
	</section>

	<section>
		<h2>Feedback and Contributions</h2>
		<p>
			If you have feedback, suggestions, or want to contribute, feel free to reach out or submit
			issues on our
			<a href="https://github.com/fdevillard/time-left">GitHub repository</a>.
		</p>
	</section>

	<footer>
		<p style="text-align: center;">Spend your time wisely. 🌟</p>
	</footer>
</main>

<style>
	main {
		font-family: Arial, sans-serif;
		max-width: 800px;
		margin: 0 auto;
		padding: 1rem;
		line-height: 1.6;
	}
	h1 {
		text-align: center;
		margin-bottom: 1.5rem;
	}
	section {
		margin-bottom: 2rem;
	}
	ul {
		margin: 1rem 0;
		padding-left: 1.5rem;
	}
	.disclaimer {
		font-style: italic;
		color: #555;
	}
</style>
