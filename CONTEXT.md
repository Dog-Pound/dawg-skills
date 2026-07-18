# Dawg Skills

Dawg Skills is the shared vocabulary for maintaining one approved skill corpus and distributing it consistently across Dog Pound repositories.

## Language

**Skill Corpus**:
The authoritative set of approved skills maintained and distributed by this repository, whether authored internally or imported from public sources.
_Avoid_: Skill collection, public-skill mirror

**Downstream Repository**:
A project repository that receives skills from the Skill Corpus.
_Avoid_: Consumer, client repository

**Sync**:
Refreshing a Downstream Repository from the current Skill Corpus.
_Avoid_: Copy, deploy

**Denylist**:
An optional Downstream Repository list of skills that Sync should omit. It is a convenience for project relevance, not an enforcement or security boundary.
_Avoid_: Blocklist, policy
