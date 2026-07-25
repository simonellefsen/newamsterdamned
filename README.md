# New Amsterdamned

> *A comedy of manners, mud and manifest larceny.*
> Manhattan Island, Anno Domini 1655.

A point-and-click adventure in the SCUMM tradition — *Day of the Tentacle*'s puzzle density,
*Grim Fandango*'s tonal nerve, *Leisure Suit Larry*'s cheerful filth — set in the muddiest,
most mismanaged company town in the Atlantic world.

You owe the Dutch West India Company **four hundred guilders**. The *Gelderland* sails in
eight days. If your debt is unpaid when it does, you belong to the Company for seven years.

Every legitimate way to raise four hundred guilders is closed to you.

**[Play it →](https://newamsterdamned.vercel.app)**

---

## What's here

**Act I — "The Wall and the Wanting" — fully playable.** Four scenes, a ten-step puzzle
chain, five characters with branching dialogue, inventory, save/load and a scoreboard.
Acts II–IV are written and designed in [DESIGN.md](DESIGN.md) but not yet built.

**Two protagonists**, and not as a reskin. Roman-Dutch law let a woman trade, sue and hold
property in her own name; English common law ninety miles east did not. Joost Baksteen is a
failed brick-maker with no standing at all. Trijn Baksteen is his widow, with legal standing
he will never have and a different set of doors closed to her. Act I opens the same door for
both; later acts do not.

**The Almanac** — thirty historical notes on everyday life in the colony, unlocked by
examining the world: what a guilder bought, why everyone drank beer at breakfast, what
half-freedom meant, how shell money worked and why it kept collapsing, what the wall was
for and which way it faced. Everything in it is true, and entries that rest on legend or
disputed figures say so.

## Running it

```bash
npm install && npm run dev
```

```bash
npm test
```

The test suite is mostly a **solvability proof**: it plays Act I start to finish through the
real engine and the real content, as both protagonists, and fails if any link in the puzzle
chain breaks. It also checks that every `GOTO` names a real scene, every `GIVE` a real item,
every walk-to point sits inside its walkbox, and that no path can spend the four stuivers
you need for the redemption fee — the one way the act could become unwinnable.

## How it's built

| | |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 runes, TypeScript strict |
| Rendering | DOM and CSS transforms over an SVG background — no canvas |
| Art | Procedurally generated painted SVG; drop-in replaceable with painted `.webp` |
| Audio | Web Audio, synthesised on demand — no binary assets |
| Deploy | Static prerender on Vercel; ~290 KB total |

**Scenes are data, not code.** A scene is a manifest — background, walkbox polygon, depth
scale, hotspots, actors — and puzzle logic is authored in a small declarative action
language (`SAY`, `GIVE`, `IF`, `GOTO`, `DIALOGUE`, `LORE`…) that an interpreter walks. The
engine never imports the content layer; content registers itself at startup. That's what
lets the placeholder art be swapped for painted backgrounds without touching code.

```
src/lib/engine/     types · state · interpreter · geometry · save · audio
src/lib/game/       scenes · dialogue · items · almanac · protagonists · art/
src/lib/components/ Stage · VerbCoin · Bubbles · Choices · Inventory · Almanac
```

**Why DOM and not canvas.** The whole game is hotspots and text. The DOM gives keyboard
navigation, screen-reader labels and free scaling for nothing, and a 2D adventure has no
frame-rate problem to solve. The game is fully playable without a mouse.

## Controls

| | |
|---|---|
| Left-click | Walk, or act on a thing |
| Right-click | Verb coin — Look, Talk, Take, Use |
| Click an item, then a thing | Use it on that |
| Double-click an item | Examine it |
| `Space` / `Enter` | Skip the current line |
| `1`–`9` | Pick a dialogue option |
| `A` | Almanac |
| `Esc` | Menu |

## A note on the history

The setting is load-bearing, not decoration: Stuyvesant's silver-banded leg, the 1653
palisade that faced the wrong way, sewant inflation, the tavern-saturated town, the schout
and his evidence chest, the twenty-three refugees from Recife and the shareholder letter
that let them stay — these are the puzzle material.

Two subjects are handled straight, with the comedy stepping back: the enslaved and
half-free Africans who built the wall and the roads, and the Peach Tree War of September
1655, which is the clock ticking under all four acts. The jokes point up — at the Company,
the Director-General, the customs men and the pious hypocrites — and never down. See
[DESIGN.md §2](DESIGN.md).

## Licence

MIT.
