<script lang="ts">
    import { browser } from "$app/environment";
    import FrequenciesEdit from "$lib/components/FrequenciesEdit.svelte";
    import GridResult from "$lib/components/GridResult.svelte";
    import ImportantPeopleEdit from "$lib/components/ImportantPeopleEdit.svelte";
    import LifeEventEdit from "$lib/components/LifeEventEdit.svelte";
    import Result from "$lib/components/Result.svelte";
    import { State } from "$lib/state.svelte";
    import { DateTime } from "luxon";

    let s = browser ? State.fromLocalStorage(localStorage) : new State();

    $effect(() => {
        if (browser) {
            State.save(localStorage, s.birthDate, s.relatives, s.lifeEvents, s.frequencies);
        }
    });

    let birthDateIso = $derived(s.birthDate ? s.birthDate.toISODate() : null);
</script>

<main>
    <h1>Time Together Calculator</h1>
    <section>
        <h2>⚠️ Warning ⚠️</h2>
        <p style="color: red;">
            This website is currently under construction 🚧 and is not feature complete yet. Some
            functionalities may not work as expected.
        </p>
    </section>
    <section>
        <h2>Purpose</h2>
        <p>
            The purpose of this website is to help you reflect on the most precious resource we all
            have:
            <strong>time with our loved ones</strong>. By estimating the average remaining time you
            might have with your relatives, the site offers a perspective that can help you
            <strong>set your priorities right</strong> and focus on meaningful connections.
        </p>
    </section>

    <section>
        <h2>Why This Matters</h2>
        <p>
            It's easy to take the time we have for granted. By understanding what little time we may
            have left with family and friends, we can make intentional choices to:
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
                    const value = (event.target as HTMLInputElement)?.value;
                    s.birthDate = value ? DateTime.fromISO(value) : null;
                } catch (e) {
                    console.info("Invalid date", e);
                    s.birthDate = null;
                }
            }}
        />

        {#if s.birthDate}
            <p>We will assume that you will live until the year {s.expectedDeath.year}.</p>
        {:else}
            <p>Please enter your birthdate to continue.</p>
        {/if}
    </section>

    {#if s.birthDate}
        <section>
            <h2>Life Events</h2>
            <p>
                To make the results more meaningful, think about events that impacted how often you
                see your relatives: when you moved out of your parent's place, met someone special,
                ended a relationship, lived abroad, started a new job, or had children.
            </p>
            <p>
                These turning points influence the time spent with loved ones and help provide a
                clearer picture of your shared time.
            </p>
            <LifeEventEdit
                lifeEvents={s.lifeEvents}
                onEventChanged={(event) => s.updateLifeEvent(event)}
                onEventDeleted={(id) => s.deleteLifeEvent(id)}
            />
        </section>

        <section>
            <h2>Important People</h2>
            <p>
                Tell us about the people who matter most to you. This could include your immediate
                family, extended relatives, close friends, or anyone who plays an important role in
                your life.
            </p>
            <ImportantPeopleEdit
                people={s.relatives}
                onPersonChanged={(p) => s.updateRelative(p)}
                onPersonDeleted={(id) => s.deleteRelative(id)}
            />
        </section>

        <secion>
            <h2>Weekly frequency</h2>
            <p>Think of how often you see someone on a weekly basis during the specific period</p>
            <FrequenciesEdit
                lifeEventsWithDeath={s.eventsWithDeath}
                people={s.relatives}
                frequencies={s.frequencies}
                onFrequencyUpdate={(updated) => s.updateFrequency(updated)}
            />
        </secion>

        <section>
            <h2>Results</h2>
            <p>
                Based on the information you provided, here is an estimate of the time you have left
                with your loved ones:
            </p>
            <Result results={s.results} />

            <h3>As grid:</h3>
            <GridResult grid={s.resultsAsGrid} />
        </section>
    {/if}

    <section>
        <h2>Disclaimer</h2>
        <p class="disclaimer">
            This tool is meant for <strong>reflective purposes only</strong>. All calculations are
            based on estimates and averages and are not a prediction of actual life expectancy or
            circumstances.
        </p>
        <p class="disclaimer">
            <strong>Data Privacy:</strong> Your data is stored locally in your browser and is never sent
            to any remote servers. This ensures your personal information remains private and secure.
        </p>
    </section>

    <section>
        <h2>Feedback and Contributions</h2>
        <p>
            If you have feedback, suggestions, or want to contribute, feel free to reach out or
            submit issues on our
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
