# Dawg Skills

A curated skill collection for agentic software development.

## Sync

Add a thin target to each downstream `Makefile`:

```make
.PHONY: skills-sync
skills-sync:
	./scripts/sync-skills
```

Put the command in the sibling top-level `scripts/` directory:

```bash
#!/usr/bin/env bash
set -euo pipefail

npx skills add Dog-Pound/dawg-skills --skill '*' --agent codex claude-code -y
node .agents/skills/dawg-routing/scripts/sync-agents.mjs
```

Run `make skills-sync`. It installs the entire corpus and safely synchronizes the managed routing block in `AGENTS.md`.

CI verifies routing without modifying files:

```bash
node .agents/skills/dawg-routing/scripts/sync-agents.mjs --check
```
