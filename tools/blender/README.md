# Blender — local art tool

**Installed.** Blender **5.2.0 LTS** lives at `/Applications/Blender.app`.

The look, camera lock, and drop-in contract live in **[`docs/ART.md`](../../docs/ART.md)**. Read that before opening a second room.

Also on this machine: **Krita** (paint-over), **Affinity** (paint-over), **TexturePacker** (character sheets, later).

```bash
/Applications/Blender.app/Contents/MacOS/Blender --version
# Blender 5.2.0 LTS
```

```bash
npm run art:plates
# writes tools/blender/plates/{sceneId}.svg — camera background + walkbox guides
```

## blender-mcp (agent control)

The Grok MCP server `blender` is project-scoped in `.grok/config.toml`. It talks to a socket the Blender add-on opens on `localhost:9876`. The add-on is enabled in Blender 5.2 user prefs (`Interface: Blender MCP`).

**This session cannot see those tools until Grok reloads MCP** (`/mcps` → `r`, or a new session).

```bash
# 1. Open a GUI Blender (the socket will not start in -b / background)
./tools/blender/open-mcp.sh

# 2. If the sidebar does not say "Running on port 9876":
#    press N → BlenderMCP tab → Connect to MCP server

# 3. In Grok: /mcps, confirm blender is connected
```

Refresh / reinstall the add-on after a `blender-mcp` upgrade:

```bash
uvx blender-mcp install-addon
# then in Blender: disable + enable "Interface: Blender MCP"
```

Telemetry is off (`DISABLE_TELEMETRY=true` in the MCP env). Poly Haven / Sketchfab / Hyper3D stay off unless you tick them in the N-panel.

The add-on can run arbitrary Python inside Blender. Save the `.blend` before asking an agent to drive it.

Do **not** run `uvx blender-mcp` by hand in a terminal — Grok launches that process.

## Drop-in

| | |
|---|---|
| Plate | `static/art/{sceneId}.webp` |
| Occluder | `static/art/{sceneId}-occluder.webp` (full-frame, transparent except the near plane) |
| Register | `src/lib/game/art/manifest.ts` |
| Fallback | procedural SVG in `src/lib/game/art/scenes*.ts` |

Stage already accepts a URL background and sorts `Scene.layers` against actor feet. Do not inject a URL through `{@html}`.

## Headless invoke

```bash
/Applications/Blender.app/Contents/MacOS/Blender --background --python tools/blender/<script>.py
```

Pearl Street is the look-dev sign-off. Act I plates now ship for `pearl-street`,
`wooden-horse`, `fort-gate`, and `land-gate`. Same camera lock for the rest.

Do **not** commit `.blend` files or raw renders to git until a pack policy is decided.
