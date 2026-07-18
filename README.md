# Dawg Skills

A curated skill collection for agentic software development.

## Install

```bash
git clone https://github.com/Dog-Pound/dawg-skills.git
cd dawg-skills
npx skills add "$PWD/.agents/skills"
```

Choose the skills and agents when prompted. To make the baseline routing mandatory, copy [Required routing](AGENTS.md#required-routing) into the downstream repository's `AGENTS.md`.

## Structure

- `.agents/skills/` is canonical.
- `.claude/skills/` contains Claude symlinks.
- `skills-lock.json` tracks upstream skills.
