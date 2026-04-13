# Integration Rules

## Goal
Allow adding external GitHub repos without turning V3 into a mess.

## Rules
1. Never dump imported repos into random top-level folders.
2. Every imported repo must have a manifest entry in `catalog/integrations.json`.
3. Every imported repo must live behind a local wrapper or adapter boundary.
4. Track source repo, license, local mount path, status, and modification notes.
5. Prefer extracting only the needed parts over cloning entire ecosystems into runtime paths.
6. Keep imported runtime code separate from local shell code.

## Status values
- draft
- integrated
- live
- disabled
- broken

## Types
- game
- app
- emulator
- proxy
- shared-ui
- backend
