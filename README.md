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

**Acts I and II are fully playable** — eight scenes, two puzzle chains, nine characters
with branching dialogue, inventory, save/load and a running scoreboard out of 500.

**Act I — "The Wall and the Wanting."** You wake in the Strand mud with no breeches and a
summons nailed to your shirt. It ends with a page torn out of a tavern ledger and a name.

**Act II — "Sewant Standard."** Somebody is buying *white* shell money at the *purple*
price, every Tuesday, in public, in his own hand. You decide the clever move is to get in
on it, which means learning to counterfeit the currency of New Netherland from a sack of
rotting whelk, a smuggled dyewood banned in England as "false and deceitful", and a tub
behind a tannery that we will not be describing here.

Your first fathom is the finest work you have ever done, and it is rejected **for being too
good** — real beads are drilled from both ends and the two bores never quite meet, and yours
have no fault in them at all. The fix is to do it again, worse. That is the act.

Acts III–IV are written and designed in [DESIGN.md](DESIGN.md) but not yet built.

**Two protagonists**, and not as a reskin. Roman-Dutch law let a woman trade, sue and hold
property in her own name; English common law ninety miles east did not. Joost Baksteen is a
failed brick-maker with no standing at all. Trijn Baksteen is his widow, with legal standing
he will never have and a different set of doors closed to her. It pays off at the end of
Act II, where the same transaction is two different scenes: Trijn signs for herself, and
Joost — a man whose earnings his creditor may simply take — has to sign as nobody at all.

**The Almanac** — forty-three historical notes on everyday life in the colony, unlocked by
examining the world: what a guilder bought, why everyone drank beer at breakfast, what
half-freedom meant, how a wampum bead was actually made and how long it took, why the first
paved street in New York was paved, what a mordant is and where you got one. Everything in
it is true, and entries that rest on legend or disputed figures say so.

## Running it

```bash
npm install && npm run dev
```

```bash
npm test
```

The test suite is mostly a **solvability proof**: it plays each act start to finish through
the real engine and the real content, as both protagonists, and fails if any link in a
puzzle chain breaks. Alongside that it checks every `GOTO` names a real scene, every
`GIVE` a real item, every walk-to point sits inside its walkbox, every Almanac entry is
reachable, every protagonist token is one the resolver knows, no scene narration hard-codes
a gendered pronoun, and no scoring line can be picked twice.

It also locks in the specific ways each act could become unwinnable — that nothing can spend
the four stuivers Act I needs for the redemption fee, and that Act II never consumes the
shell, the logwood or the mordant, all of which are needed for a second batch you do not
know about yet.

## How it's built

| | |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 runes, TypeScript strict |
| Rendering | DOM and CSS transforms over an SVG background — no canvas |
| Art | Procedurally generated painted SVG; drop-in replaceable with painted `.webp` |
| Audio | Web Audio, synthesised on demand — no binary assets |
| Deploy | Static prerender on Vercel; ~420 KB total |

**Scenes are data, not code.** A scene is a manifest — background, walkbox polygon, depth
scale, hotspots, actors — and puzzle logic is authored in a small declarative action
language (`SAY`, `GIVE`, `IF`, `GOTO`, `DIALOGUE`, `LORE`…) that an interpreter walks. The
engine never imports the content layer; content registers itself at startup. That's what
lets the placeholder art be swapped for painted backgrounds without touching code.

```
src/lib/engine/     types · state · interpreter · geometry · save · audio
src/lib/game/       scenes · dialogue · items · almanac · protagonists · act2/ · art/
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
