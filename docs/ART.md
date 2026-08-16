# Art bible — painted 2.5D

The contract for anyone (or any agent) taking over visual work. Procedural SVG in
`src/lib/game/art/` is the fallback and the camera. Painted plates drop in without
touching walkboxes, hotspots, or the engine.

Related: `DESIGN.md` §6–7, `tools/blender/README.md`, `src/lib/game/art/palette.ts`.

---

## Target

Grim Fandango's *method* (build the room, lock the camera, render a picture),
Day of the Tentacle's *character animation* (walk / idle / talk with a silhouette
you can name), Leisure Suit Larry VGA's *room-as-painting*. Palette and tone stay
Dutch Golden Age — Cuyp dawn, Vermeer yellow, van Goyen haze. Not live 3D. Not
DOTT ink-and-wash. Act IV is not a cartoon.

**Look-dev scene is Pearl Street.** It is also the title card. Do not factory the
other fourteen rooms until a cold screenshot of Joost in the Strand mud, no UI,
reads as the same *kind* of picture as a VGA LucasArts still.

---

## Frame and camera

| | |
|---|---|
| Logical frame | 1280×720 |
| Render | 2560×1440, encode WebP q~80, ~80–200 KB |
| Camera | Orthographic-leaning, slight perspective. No new angle that orphans the walkbox. |
| Horizon | Locked to the current SVG. Pearl Street = y **322**. |
| Depth | Walkbox y *is* depth. `scale.near` / `scale.far` already on every scene. |

Export a camera plate before modelling:

```bash
npm run art:plates
```

Plates land in `tools/blender/plates/{sceneId}.svg` — current picture, walkbox
(magenta), hotspots (cyan), occluder contact line (gold), entry pip. Import as a
Blender camera background and lock the 1280×720 frame to it.

Headless Blender: `/Applications/Blender.app/Contents/MacOS/Blender` (5.2.0 LTS).

---

## Local tool belt

Install and role of each tool: **[README → Art tooling](../README.md#art-tooling)**.

Shipped plates and sprites were locked in Blender (Pearl Street whitebox), painted with xAI Imagine, and encoded / keyed with `sharp`. Krita, Affinity and TexturePacker are available for later paint-over and walk-cycle sheets.

To let an agent talk to Blender:

```bash
./tools/blender/open-mcp.sh
# In a new Grok session (or /mcps → r): blender tools should appear
# once Blender is open. N-panel → BlenderMCP → Connect if the socket
# did not auto-start.
```

---

## Light (already authored; the SVG cannot deliver it)

One key per scene. The comments in `art/scenes*.ts` are the brief.

- **Act I** — dawn → firelight → noon → dusk
- **Act II** — full market sun, downhill into a panelled room with real glass
- **Act III** — morning council light → candles at noon → dusk fire → one flame on a page
- **Act IV** — the same Strand at dawn, then the wrong light, then none. Grey, smoke, one bad orange.

`src/lib/game/art/palette.ts` is law. No new hero hue.

---

## Brush

Painterly NPR (Eevee + compositor, or Grease Pencil over a 3D blockout). Visible
stroke. Soft edges far away, harder near. Not photoreal, not cel-flat.

Every room has a **near plane**: something at the bottom edge (barrel, post, canoe,
table lip) that can occlude the actor. That is what `Scene.layers` is for.

---

## People

Painted PNG frames live in `static/art/sprites/` and register in
`src/lib/game/art/sprites.ts`. Magenta studio backdrops are keyed with
`node scripts/art/key-magenta.mjs`. Right views flip the left frame.
SVG `sprite()` remains the fallback.

1650s Dutch silhouette first: wide-brimmed hat, falling-band collar, barrel
doublet, baggy knee breeches. Must read at 40px tall.

Sprite sheets (when they exist): 4 facings × idle (4) / walk (8) / talk (4).
SVG `sprite()` in `art/actor.ts` stays the fallback. Honour `prefersReducedMotion`.

Joost and Trijn first, both dress states. Then Stuyvesant, Griet, Levy,
van Tienhoven, Mattaneck. Everyone else is a dressed kit plus one identifying prop.

---

## Engine drop-in

1. Put `{sceneId}.webp` (and optional `{sceneId}-occluder.webp`) in `static/art/`.
2. Register them in `src/lib/game/art/manifest.ts`.
3. Stage prefers the plate; delete `static/art/` and the procedural SVG returns.

Do **not** re-author walkboxes to fit a prettier camera. If the blockout render
lies about the mud plane, fix the camera.

Do **not** commit `.blend` files or raw renders until a pack policy is decided.
Voice packs already stay off git; treat painted art the same way if the files
get large.

---

## First week

1. Occluder layers + art manifest — done.
2. Look-dev plates on disk: `static/art/pearl-street.webp` and
   `wooden-horse.webp` (oil-painted over the locked SVG camera). Title card
   uses the Pearl Street plate. SVG remains the fallback if those files vanish.
3. Idle breath on the player and NPCs; ambience light overlays (water / fire /
   candle). Honour reduced motion.
4. Act I outdoor rooms painted: `fort-gate.webp` (noon) and `land-gate.webp`
   (dusk), same locked cameras. Occluders still only Pearl Street's shed strip.
5. Next: painted near-plane occluders for the sentry box / stall, remaining
   hero NPCs, then Joost's walk cycle.
