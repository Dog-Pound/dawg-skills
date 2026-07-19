# Filesystem Contract

The planned tree is part of every code change's design contract and any review of file or module placement. Compress a trivial one-file change to one line; use trees for everything else.

## Before code

Show the relevant existing pattern, then the target tree. Annotate every known file with a brief `add`, `change`, `move`, `delete`, or `affected` phrase that states what changes. The package shape should make ownership and reused patterns visible without a separate topology essay.

```text
Existing pattern

src/core/operations/
├── models.py             operation contracts
└── registry.py           explicit registration

Target

src/core/evaluation/
├── models.py             move — make Evaluation first-class
├── pipeline.py           change — resolve evaluators through Registry
└── registry.py           add — own registration and lookup
```

Every added file names:

1. its owner;
2. the behavior or policy it hides; and
3. why that behavior does not belong in an existing deep module.

Plans describe intent, not module names. Compare the proposed file with extending the owner and keeping the behavior inline. A label such as “clean separation” does not justify a boundary.

## Audit

| Test | Question |
|---|---|
| Necessity | Does this file or hunk prove the tracer? |
| Completeness | Would removing it break correctness? |
| Ownership | Does it have one reason to change and one discoverable owner? |
| Depth | Does its interface hide enough behavior to earn another boundary? |
| Smaller | Can an existing owner express the same behavior with fewer moving parts? |
| Drift | Does the actual tree match the annotated target tree? |

During Verify, reconcile the planned and actual trees. An unexplained file or placement returns the work to Decide.
