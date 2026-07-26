<script lang="ts">
	import Game from '$lib/components/Game.svelte';
</script>

<svelte:head>
	<title>New Amsterdamned — a comedy of manners, mud and manifest larceny</title>
	<meta
		name="description"
		content="A point-and-click adventure set in New Amsterdam, 1655. You owe the West India Company four hundred guilders and the tide turns Thursday week."
	/>
	<meta name="theme-color" content="#0c0907" />
	<meta property="og:title" content="New Amsterdamned" />
	<meta
		property="og:description"
		content="A comedy of manners, mud and manifest larceny. Manhattan Island, Anno Domini 1655."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<main>
	<Game />
</main>

<footer>
	<p>
		All four acts · Everything in the Almanac is real ·
		<a href="https://github.com/simonellefsen/newamsterdamned">Source</a>
	</p>
</footer>

<style>
	main {
		padding: clamp(0.4rem, 1.6vw, 1rem) clamp(0.4rem, 1.6vw, 1rem) 0;
	}

	footer {
		padding: 0.6rem 1rem;
		text-align: center;
	}

	footer p {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.62rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--parchment-dim);
		opacity: 0.45;
	}

	footer a {
		color: inherit;
	}

	footer a:hover {
		color: var(--gold);
	}
</style>
