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
```

Run `make skills-sync` to install the entire corpus.
