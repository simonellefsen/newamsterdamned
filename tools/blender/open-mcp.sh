#!/bin/zsh
# Open Blender GUI so the MCP add-on can listen on localhost:9876.
# Background (`-b`) mode cannot host the socket — the add-on refuses it.
set -euo pipefail
exec open -a Blender "$@"
