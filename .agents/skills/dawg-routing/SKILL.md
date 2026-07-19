---
name: dawg-routing
description: Synchronize the canonical Dawg Skills routing block into a repository AGENTS.md after installing the corpus.
disable-model-invocation: true
---

# Dawg Routing

Run `node .agents/skills/dawg-routing/scripts/sync-agents.mjs` after installing skills. Use `--check` in CI to detect drift without writing.

The script projects [agents-policy.md](references/agents-policy.md). It preserves all content outside the marked block and refuses malformed or duplicate markers.
