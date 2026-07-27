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
| Right-click / long-press / `V` on a hotspot | Verb coin — Look, Talk, Take, Use |
| Verb coin: arrows or `1`–`4` | Pick a verb (Esc closes) |
| Click an item, then a thing | Use it on that |
| Double-tap / double-click an item | Examine it (touch-friendly) |
| `Space` / `Enter` / **Continue** | Skip the current line (Continue appears under the bubble after a beat) |
| `1`–`9` | Pick a dialogue option |
| `A` | Almanac |
| `H` | Hint — what am I doing? |
| `M` | Map of visited places (no teleport) |
| `?` | Controls reference |
| `[` / `]` or top-bar **A−** / **A+** | Smaller / larger dialog text (bubbles + choices) |
| Hold `Space` or the 👁 button | Show what is interactive |
| `Esc` | Cancel “use item”, close panels, or open the menu |

Selecting **Use** on an inventory item shows a banner with **Cancel** (also Esc, empty stage click, or re-click the item after a pause). Double-tap an item to examine it. Loading a slot from the Ledger asks for confirmation, then autosaves current progress so a mistaken load is recoverable.

Switching away from the tab freezes dialogue hold times, pauses spoken voice, and suspends ambience so lines do not auto-advance in the background. The browser tab title shows **Paused · New Amsterdamned** while you are away; on return mid-line, Continue appears immediately as **Resume**.

The first time you enter play on a device, a short **How to play** card appears after a few seconds (dismiss with Got it, Esc, or open the full list). Reopen any time with **?**.

**Continue** on the title screen loads the newest save, or opens a picker when several slots exist — load, export, or delete each slot, and import JSON into slots 1–3. Esc → Ledger can also delete slots (including Autosave).

Spoken voice is **off by default**. Open **Settings** on the title screen (or **Esc → Preferences** in-game):

- **Dialog text** — Normal through Huge (`[` / `]` or A−/A+ while playing)
- **Motion** — Match system / Reduce / Full (walk bob + UI transitions)
- **Spoken voice** — On / Off  
- **Voice source** — Auto (pack → OpenAI → system), pack only, or system only  
- **Test system voice** — free OS sample, no API key  
- **OpenAI API key** — optional; Save / Test / Clear (this browser only). Test uses same-origin `/api/tts`.  
- **How to get an API key** — foldout with links to platform signup, keys, and billing  

Modals (menu, settings, almanac, hints, map) trap keyboard focus until closed. Captions always stay on.

```bash
npm run voice:extract              # corpus size / dual-protag cost estimate
npm run voice:generate             # dry-run Act I → .voice-out/v1 (no API key)
npm run voice:generate:live        # OpenAI TTS → static/voice/v1/ (needs OPENAI_API_KEY)
```

Optional flags after `--`:

```bash
npm run voice:generate -- --limit=20 --speakers=narrator
npm run voice:generate:live -- --act=1 --speakers=narrator,joost,trijn
npm run voice:generate:live -- --model=gpt-4o-mini-tts --limit=3
```

Copy `.env.example` → `.env.local` and set `OPENAI_API_KEY` for live runs. `npm run voice:generate:live` loads `.env` then `.env.local` automatically (Vite’s dev server does the same; a bare `node` process does not). You can also `export OPENAI_API_KEY=…` in the shell.

**Default model is `tts-1`.** If OpenAI returns *Project … does not have access to model `tts-1`*, either enable `tts-1` under that project’s model limits in the [API dashboard](https://platform.openai.com/), or pass `--model=gpt-4o-mini-tts` (OpenAI’s current default speech model; different pricing).

MP3s go under `static/voice/v1/lines/` (**gitignored** — ~50MB+ for Act I). The tracked `manifest.json` lists every line so the game knows what the pack contains. After a live generate:

```bash
npm run voice:verify                 # 521 files, no missing/tiny clips
npm run dev                          # play locally; Settings → Spoken voice On, source Auto
```

**Local play:** pack files are served from `/voice/v1/` by Vite. Enable voice in Settings (title or Esc → Preferences) — the **Voice pack** panel shows whether Act I audio is present and can **Test pack** with a short clip.

**Deploy (MP3s are gitignored — GitHub→Vercel will not ship them):**

| Path | How |
|---|---|
| **A. Prebuilt CLI** (includes local `lines/`) | With pack on disk: `npm run build && npx vercel deploy --prebuilt` |
| **B. Cloudflare R2 (recommended free tier)** | See **R2 setup** below |
| **C. Generic CDN** | `npm run voice:stage` → upload tarball contents → set `PUBLIC_VOICE_BASE_URL` |
| **D. No pack on prod** | Game still works; voice falls through to browser OpenAI key / system TTS / silent |

### R2 setup (Cloudflare)

1. **Enable R2 once** in the dashboard: [R2 Overview](https://dash.cloudflare.com/?to=/:account/r2) → Get started (accept free tier if prompted).
2. Log the CLI into Cloudflare: `npx wrangler login`
3. From a machine that has the pack (`npm run voice:verify` OK):

```bash
npm run voice:upload-r2
# optional: -- --bucket=my-bucket-name
```

4. In the bucket **Settings**:
   - **Public Development URL** → Enable (dev/rate-limited; fine for a hobby game)
   - **CORS**: allow `GET`/`HEAD` from `https://newamsterdamned.vercel.app` and `http://localhost:5173`
5. Set on Vercel (Production + Preview), then redeploy:

```text
PUBLIC_VOICE_BASE_URL=https://pub-XXXX.r2.dev/voice/v1/
```

(Use the public URL shown in the bucket settings, with `/voice/v1/` at the end.)

CDN hosts must allow cross-origin `fetch` of `manifest.json` if the CDN origin differs from the game (`Access-Control-Allow-Origin`). Confirm provider ToS allows public redistribution before shipping packs.

**TTS cache (cost control):** every successful API clip is stored under `.voice-cache/{model}/{voice}/{key}.mp3`. Re-runs check, in order: pack `lines/` → durable cache → API. Unchanged lines never re-bill. Summary logs `api` / `cacheHits` / `diskHits` and rough `$ avoided`.

```bash
npm run voice:generate:live -- --act=1          # first run: pays for new keys
npm run voice:generate:live -- --act=1          # second run: all cache hits
npm run voice:generate:live -- --no-cache       # force re-synthesize (still updates cache)
npm run voice:generate:live -- --cache-dir=/path/to/shared-cache
```

Default cast (OpenAI voices): narrator=`onyx`, Joost=`echo`, Trijn=`nova`. Edit `OPENAI_VOICE_CAST` in `src/lib/engine/voice/generate.ts` after listening. Changing model or cast voice misses cache for those lines only.

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
