# Dawg Skills

A curated skill collection for agentic software development.

## Install

```bash
npx skills add Dog-Pound/dawg-skills --skill '*' --agent codex claude-code -y
```

This installs every skill for Codex and Claude Code. To make the baseline routing mandatory, copy [Required routing](AGENTS.md#required-routing) into the downstream repository's `AGENTS.md`.

Pull future updates with:

```bash
npx skills update -p -y
```

## Structure

- `.agents/skills/` is canonical.
- `.claude/skills/` contains Claude symlinks.
