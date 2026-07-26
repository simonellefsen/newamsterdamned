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

**All four acts are playable, start to finish** — fifteen scenes, seventeen characters with
branching dialogue, inventory, save/load, sixty-three unlockable historical notes and a running
scoreboard out of 970.

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

**Act III — "The Company's Conscience."** The Schout Fiscal hires you to write the town's
case against two men who have asked to stand the night watch at the Wall — and mentions, very
pleasantly, that he has read the pawnbroker's returns and knows what you did with a certain
silver-banded leg. In the fort you find the letter the directors in Amsterdam sent in April,
which already refused the Director-General on this exact question, for two reasons and
neither of them mercy: the losses their Jewish shareholders took when Portugal retook Brazil,
and the amount of capital those shareholders still have in the Company.

Then you have three people who want it, and the game never tells you which one is right. The
scoreboard has an opinion. It does not share it until afterwards.

**Act IV — "Peach Season."** The fifteenth of September, 1655, at dawn, on the same fifty yards
of mud where you woke up with no breeches. Every soldier in the province is a hundred miles
south taking a fort off the Swedes. There is a ship at the wharf that sails on the evening tide
and her master will take you as clerk, because you can write.

Then you look at the water, and there are sixty-four canoes on it.

The klapperman is asleep in the mud with his rattle beside him, exactly as he was on the first
morning. In Act I you used it to make one man run away from a fire that did not exist. Now you
put it in his hand and he raises the town with it.

And then it is the afternoon, and there are five people out in the street, and you have three
trips. **No rescue in this act is worth a single point.** Three acts of Sierra scoring have
taught you to read points as approval, and this one will not grade who you went back for. The
lane down to the wharf is open the entire time, nothing hints against it, and it ends the game.

**Two protagonists**, and not as a reskin. Roman-Dutch law let a woman trade, sue and hold
property in her own name; English common law ninety miles east did not. Joost Baksteen is a
failed brick-maker with no standing at all. Trijn Baksteen is his widow, with legal standing
he will never have and a different set of doors closed to her. It pays off at the end of
Act II, where the same transaction is two different scenes: Trijn signs for herself, and
Joost — a man whose earnings his creditor may simply take — has to sign as nobody at all.

**Getting unstuck.** Three separate affordances, because being lost in an adventure game is
three different problems. The cursor tells you what a thing *is* before you click it — a
magnifier over an object, a speech bubble over a person, a blue arrow pointing the way an exit
goes. **Holding <kbd>Space</kbd>** rings everything the scene is currently offering; not every
polygon that will ever exist in the room, only what is live right now, which is what makes it
help rather than a wall of boxes. And <kbd>H</kbd> opens **"What am I doing?"** — the current
objective, then a nudge if you ask, then the plain answer if you ask again. Asking costs
nothing; a hint system that charges you is one people refuse to use and quit instead.

One objective has no answer and says so. The three trips in Act IV are not a puzzle, so the
panel declines to advise and tells you that whatever you decide is what happened.

**The Almanac** — sixty-three historical notes on everyday life in the colony, unlocked by
examining the world: what a guilder bought, why everyone drank beer at breakfast, what
half-freedom meant, how a wampum bead was actually made and how long it took, why the first
paved street in New York was paved, what a mordant is and where you got one, what a notary
actually did, why nobody was ever paid in coin, what happened to Asser Levy afterwards
— which is the best answer this game has to anything — and, at the end, what the fifteenth of
September actually cost and why the peaches were the date rather than the reason. Everything in
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

Act III has three endings, so the suite also proves all three are reachable and that only one
of them scores — otherwise a well-meaning edit could quietly pay the player for selling out. For
Act IV it goes further and asserts that *no* script which resolves a rescue awards any points at
all, that each rescue spends exactly one of the three trips, and that the gate shuts on the
third whichever three you took.

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
| Audio | Web Audio — synthesised SFX plus procedural scene ambience beds |
| Deploy | Static prerender on Vercel; ~420 KB total |

**Scenes are data, not code.** A scene is a manifest — background, walkbox polygon, depth
scale, hotspots, actors — and puzzle logic is authored in a small declarative action
language (`SAY`, `GIVE`, `IF`, `GOTO`, `DIALOGUE`, `LORE`…) that an interpreter walks. The
engine never imports the content layer; content registers itself at startup. That's what
lets the placeholder art be swapped for painted backgrounds without touching code.

```
src/lib/engine/     types · state · interpreter · geometry · save · audio
src/lib/game/       scenes · dialogue · items · almanac · protagonists · act2/ · act3/ · act4/ · art/
src/lib/components/ Stage · VerbCoin · Bubbles · Choices · Inventory · Almanac
```

**Why DOM and not canvas.** The whole game is hotspots and text. The DOM gives keyboard
navigation, screen-reader labels and free scaling for nothing, and a 2D adventure has no
frame-rate problem to solve. The game is fully playable without a mouse.

## Controls

| | |
|---|---|
| Left-click | Walk, or act on a thing |
| Right-click / long-press | Verb coin — Look, Talk, Take, Use |
| Click an item, then a thing | Use it on that |
| Double-click an item | Examine it |
| `Space` / `Enter` | Skip the current line |
| `1`–`9` | Pick a dialogue option |
| `A` | Almanac |
| `H` | Hint — what am I doing? |
| `M` | Map of visited places (no teleport) |
| Hold `Space` or the 👁 button | Show what is interactive |
| `Esc` | Menu (save/load + audio/text/voice preferences) |

Spoken voice is **off by default**. Turn on **System voice (beta)** in the Esc menu to hear the OS read lines (narrator, protagonists, NPCs). Quality depends on your platform voices; captions always stay on.

## A note on the history

The setting is load-bearing, not decoration: Stuyvesant's silver-banded leg, the 1653
palisade that faced the wrong way, sewant inflation, the tavern-saturated town, the schout
and his evidence chest, the twenty-three refugees from Recife and the shareholder letter
that let them stay — these are the puzzle material.

Three subjects are handled straight, with the comedy stepping back: the enslaved and
half-free Africans who built the wall and the roads; the 1654 refugees and the exclusion
Stuyvesant asked Amsterdam for in writing, which Act III quotes rather than softens; and the
Peach Tree War of September 1655, which is the clock ticking under all four acts and which Act
IV walks straight into. Asser Levy and Jacob Barsimson are real men and they get the clearest
arguments in the game — the bigotry in Act III belongs to institutions and to named officials'
documented positions, and it is never played for a laugh.

In Act IV the comedy stops rather than darkens. No death is invented: about a hundred colonists
were killed over three days and the record names very few of them, so the game does not put a
named real person in a grave the record did not. The raiders are not weather and not a monster —
Kieft's massacre at Pavonia twelve years earlier, land bought twice and paid for once, and a
Dutch fleet that had just gone south to take the Susquehannock's trading outlet are all on the
page, and nobody gets to call it senseless without being answered. The Almanac says plainly that
Native motives here are reconstructed from records written by the people who were attacked. The jokes point up — at the Company,
the Director-General, the customs men and the pious hypocrites — and never down. See
[DESIGN.md §2](DESIGN.md).

## Licence

MIT.
