# V3 Architecture

## Top-level layout
- `server/` backend runtime, proxy, auth, config endpoints
- `ui/` frontend shell and shared components
- `catalog/` source-of-truth manifests for games/apps/emulators/integrations
- `integrations/` vendored or adapted third-party repo modules with local wrappers
- `games/` hosted game payloads and wrappers
- `apps/` hosted app payloads and wrappers
- `emulators/` emulator runtimes and wrappers
- `scripts/` build/import/admin scripts
- `docs/` specs and implementation notes

## Backend responsibilities
- static asset serving
- health endpoint for Koyeb
- proxy runtime integration
- optional password gate
- catalog/config endpoints

## Frontend responsibilities
- launcher shell
- tabs workspace
- search and discovery
- themes/settings
- lane routing

## Integration model
Every third-party import gets:
- a manifest entry
- a bounded local folder
- provenance/source notes
- status metadata
- adaptation notes

No imported repo should control the whole app or spill files across unrelated directories.
