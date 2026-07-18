# Coding Principles — Common (Language-Neutral)

> **Single source.** Code quality SSOT. Sibling baseline to [`testing.md`](testing.md). Overlays link § only — never restate.

## Naming

### Names and types tell the story

The signature is the documentation. A reader should skim **name + parameter names + parameter types + return type** and know what the function does without opening the body. Where the language has a type system, type annotations are not optional decoration — they are half the signal. Untyped parameters, untyped returns, and `any` / `dict` / `Object` blobs erase it — treat them as anti-patterns, not shortcuts.

If the signature does not narrate the work, rename it, type it, or split it. Reaching for prose to explain the function is a design smell; do not paper over it with a comment or public-surface doc (see [§API documentation: concise or absent](#api-documentation-concise-or-absent)).

```text
// bad: untyped, vague names, no return type — signature tells you nothing
process(x, y)

// bad: typed but vague
process(x: Map, y: int) -> Map

// good: name + types describe the full contract
calculateCompoundInterest(
  principal: Money,
  annualRate: Percentage,
  years: int,
) -> Money
```

Where types exist, use them on every public function and every model field. "I'll type it later" is how untyped blobs propagate across a codebase.

### No vague names

Names like `data`, `info`, `manager`, `helper`, `util`, `do_thing`, and `temp` carry no signal by themselves. Replace or qualify them with the concrete role.

```text
// bad
handle(data)

// good
normalizeInvoiceRows(rawInvoiceRows)
```

### Names carry their meaning without lookup

A name is wrong if the reader must open another file — or the instantiation site — to know what it holds. Qualify ambiguous nouns: `file_extensions`, not `extensions`; `pip_distribution`, not `distribution`; `min_text_chars_per_page`, not `threshold`. Short generic names are only acceptable when the enclosing scope fully disambiguates them (a loop variable, a comprehension).

```text
// bad: what kind of distribution? statistical? linux?
distribution: str

// good: the name is the definition
pip_distribution: str
```

### Proper public/private naming

Mark the boundary between public surface and internal implementation in whatever way the language supports (leading underscore, access modifier, module export list). Internal helpers should never look like public API.

```text
// public surface
getUserBalance(userId)

// internal — name signals "do not call from outside the module"
_roundHalfEven(value)
```

## Function Shape

### Function nesting at most 3

Three levels deep is the ceiling: function body → conditional/loop → conditional/loop. A fourth level means you need to extract a helper or invert a guard.

`try`, `with`, and `match` blocks count as nesting levels — same as conditionals and loops. Two nested `try` blocks in one function is a fourth level: batch-durability and per-item-isolation are separate concerns and belong in separate functions.

```text
// bad: 4 levels deep
function f(items: Item[]) {
  for item in items {
    if item.active {
      for child in item.children {
        if child.valid { ... }   // ← 4th level
      }
    }
  }
}

// good: extract + early return
function processActiveItems(items: Item[]) {
  for item in items {
    if !item.active { continue }
    processValidChildren(item.children)
  }
}

function processValidChildren(children: Node[]) {
  for child in children {
    if child.valid { ... }
  }
}
```

### Single-purpose functions

One function, one job. The function name should be a verb phrase that fits on one line and fully describes the work. If you need "and" in the name, split it.

```text
// bad
validateAndSaveAndNotify(user)

// good
validateUser(user)
saveUser(user)
notifyUser(user)
```

### No control-flow cascades

A long `if / elif / elif / else` chain or string-keyed `switch` is a smell. Replace with dispatch tables, polymorphism, or early returns. **Exception:** exhaustive `match` / `switch` on a closed sum type or sealed enum (Rust, Kotlin, modern Java, TypeScript discriminated unions) is correct design — the compiler enforces totality and adding a new variant becomes a compile error in every branch site, which is the opposite of a smell.

```text
// bad
if kind == "a": ...
elif kind == "b": ...
elif kind == "c": ...
elif kind == "d": ...

// good — dispatch table
HANDLERS = {"a": handle_a, "b": handle_b, "c": handle_c, "d": handle_d}
HANDLERS[kind](payload)
```

## Module Shape

### Cohesion — things that change together live together

Group state and behavior by unit of change, not by directory slogan. Data and the behavior that owns its invariants should live where the same requirement change lands. A dedicated schema or models package is fine when it is just the boundary contract; the smell is an anemic domain model: behaviorless types with invariants scattered across services, helpers, and utilities.

```text
// bad: User type in models/user; user invariants scattered across services/, helpers/, utils/
// good: a `user` module/package owns User invariants and operations; shared schemas stay in models/
```

This is the language-neutral principle behind "object-oriented organization" in OOP languages, "package cohesion" in Go, "module structure" in Rust, etc. The mechanism differs; the test does not: when one rule changes, you should touch one owning unit, not five.

No orphan `constants` / `types` shims — colocate values with the module that owns them. In stage-sequenced folders, new files must be stages — not helper or config shims; fold helpers into the owning stage module.

A function with exactly one calling module lives **in that module** — never in a neighbor it happens to share a folder with. Defining `utcnow()` in `converters.py` when only `pipeline.py` calls it is a placement bug: the reader looks for pipeline concerns in the pipeline. Promote to a shared module only when a second caller actually appears.

### Behavior on a class lives on the class

In an OOP-first language (Python, Java, Kotlin, C#, TypeScript classes), a helper used only by one class is a **private method of that class**, not a free function in the same module. Module-level free functions are reserved for:

1. The module's public API surface.
2. Helpers genuinely shared across multiple classes, or that operate on no class's data.

A class with methods that call a module-scoped private helper on instance state is a smell. Move the helper inside the class. If a free function is the right call, it should still read that way — operating on plain inputs, not on one class's instance state via parameters.

```text
// bad: free helper next to the class operates on the class's input type
class Processor {
  run(rows: InputRow[]): OutputRecord[] {
    return rows.map(group => buildRecord(group))
  }
}

function buildRecord(rows: InputRow[]): OutputRecord { ... }
function groupByKey(rows: InputRow[]): Map<string, InputRow[]> { ... }
function latest(rows: InputRow[], field: string): unknown { ... }

// good: helpers are private methods on the class that owns them
class Processor {
  run(rows: InputRow[]): OutputRecord[] {
    return [...this.groupByKey(rows).values()].map(group => this.buildRecord(group))
  }

  private buildRecord(rows: InputRow[]): OutputRecord { ... }
  private groupByKey(rows: InputRow[]): Map<string, InputRow[]> { ... }
  private latest(rows: InputRow[], field: string): unknown { ... }
}
```

### SOLID principles

Single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion — checklist, not religion. Most violations surface as "I had to change five files to add one feature".

### Deep modules — small interface, large implementation

A *deep* module exposes a small interface and hides a large, valuable implementation (Unix `open`/`read`/`write`/`close`). A *shallow* module is the opposite: a large interface, little behavior — usually pass-through methods forwarding to another layer with no added value. Module-scale, not method-scale — short methods (adapters, overrides, single-purpose helpers) are fine.

```text
// shallow — 10 methods, each a 1-line wrapper around this.db
class UserRepository {
  get(id) { return this.db.find(id) }
  save(u) { return this.db.upsert(u) }
}

// deep — small interface, real behavior hidden behind it
class UserDirectory {
  resolve(id) -> User
  // handles caching, soft-deletes, denormalized lookups, audit logging — caller sees none of it
}
```

Cost = interface size. Value = (useful) implementation size. Maximize the ratio.

### Loose coupling between modules

Modules should know as little about each other as possible: depend on narrow public contracts, pass data instead of module internals, and avoid deep imports. Introduce an interface when a volatile boundary or multiple implementations earn it. The test: can a boundary implementation change without rewriting its callers?

```text
// bad: caller knows the concrete storage backend
report.writeToPostgres(connection)

// good: caller depends on an interface
report.writeTo(storage)   // storage can be Postgres, S3, file, in-memory
```

### Modules are blackboxes with clear I/O

A module should be usable knowing only its inputs, outputs, and contracts — never its internals. If a caller has to read the implementation to use it correctly, the interface is wrong.

```text
// good: contract is self-evident
parseIsoTimestamp(raw: string) -> datetime  // throws on malformed input
```

### Project layers are first-class citizens

Top-level folders map to recognized layers **for this project type** — no cargo-cult, no new folder without a layer role. Concrete folder names and layer tables live in the stack overlay (e.g. FastAPI, React).

```text
// bad: ad-hoc folders at app root with no layer role
// legacy/, scripts/, tmp/

// good: each top-level folder maps to a recognized layer for this stack
// (exact names depend on project — see stack overlay)
```

### One concept, one owner module

One registration owner per cross-cutting concern. Splitting dependency wiring, lifecycle hooks, and holder state across multiple modules is a smell — one module should own registration, injection, and startup/shutdown for each concern. Concrete file names and injection syntax → stack overlay.

```text
// bad — DI split across modules
import { appState } from "./holders"
import { initApp } from "./bootstrap"

// good — one module owns holders, injection, startup/shutdown, registration
import { AppState, registerResources } from "./dependencies"
```

### One import path per symbol

No re-export shims. Import from the owning module. Cross-layer imports via package public API only — not deep internals.

```text
// bad — re-exported through barrel/index shims
import { ScoreRequest } from "myapp"

// good — import from owning module
import { ScoreRequest } from "myapp/models/score"
```

### No conjoined methods

Two methods are "conjoined" when calling one without the other breaks the object: `start()` requires a later `commit()`, `open()` requires a later `close()`, `beginBatch()` requires a later `flushBatch()`. Replace with a single call (context manager, builder, transaction block) so the caller can't forget.

```text
// bad
job.start()
... // caller must remember
job.commit()

// good
with job.run():
  ...
```

## Data

### No raw dicts, no magic strings

Untyped maps (`dict[str, Any]`, `Map<string, any>`, `Object`) crossing module boundaries are an invitation to drift — callers don't know the shape and contracts erode. At the **boundary** (cross-module APIs, function signatures, exported types), use typed records (dataclasses, structs, Pydantic models, TypeScript interfaces). Inside a single module, or at the wire edge where JSON is the format, raw maps are fine **if you validate into typed records at the edge**. Bare string literals shared across modules belong in enums or constants.

```text
// bad: untyped map crossing a public function boundary
update(userId: string, fields: Map) -> Map

// good: typed contract at the boundary
update(userId: string, fields: UserUpdate) -> User

// fine: raw map immediately after parsing JSON, then validated
raw = parseJson(payload)
user = validateIntoUser(raw)   // typed from here on
```

Data models shared across modules belong to one owner selected by the stack overlay — never duplicated inline at each boundary.

## Comments

### Comments explain why, not what

The code already says *what*. Comments exist to capture intent, constraints, or trade-offs the code cannot express: why this algorithm, why this odd-looking branch, why this non-obvious ordering. If the *why* is trivial, omit the comment — a redundant comment is overhead and a future drift surface. Never comment to narrate what the code is doing; the code is the truth, and any modern reader (human or AI) can read it. If you feel the need to explain a chunk of code, the code is probably wrong — refactor first (extract a function, rename a variable, simplify control flow) and only comment if the *why* still isn't obvious.

Comments never carry metadata: no ADR/ticket/plan references, no review-thread context, no "moved from X", no decision provenance. That history lives in ADRs, commit messages, and PR threads — code states only what a maintainer needs *now*. No TODO comments — follow-up work lives in the backlog, not the source.

Required one-line `why` comment when using a typed escape hatch (`any`, `!`, `Any` at the edge) — this is the SSOT the react-typescript overlay links up to.

```text
// bad — narrates what the code already says
i += 1   // increment i

// good — captures non-obvious intent
// Use binary search: input is sorted and >100k rows; linear scan is 10x slower in practice.
idx = binarySearch(rows, target)
```

### API documentation: concise or absent

Public surfaces — modules, classes, public functions — **may** carry a docstring when it adds signal beyond the signature: the one-line contract, invariants, error behavior, side effects, ordering, performance, or threading guarantees. Never restate the name, parameter names, parameter types, or return type — the signature owns that. When the signature already tells the whole story, stay silent.

Hard ceiling: **two lines maximum** for every docstring — module, class, or function. One tight sentence is the target. No paragraph prose, no project-fit narrative, and **no metadata**: no ADR/ticket/PR references, no dependency claims, no "follow-up lands later" — only statements that stay true by reading the source (see [§Comments explain why](#comments-explain-why-not-what)).

Forbidden:

- **Docs that paraphrase the name or fields.** If the name and types tell the story, stay quiet.
- **Constant docs or block comments on constants.** The constant's name conveys the intent; if it doesn't, rename the constant.
- **Private helper docs.** Name + types + body are sufficient. If they aren't, fix the name or split the body.
- **Docs describing planned unimplemented behavior.** Implement or delete; Jira/spec owns follow-up.

Documentation that narrates *what* the function does line-by-line is a future lie. Wrong docs are worse than absent.

```text
// good: whole contract in one line
class Converter {
  // "One source format -> faithful markdown rendition."
}

// good: concise module docstring
// "Raw -> staged document conversion (bronze -> silver)."

// bad: metadata in the docstring — rots the moment the follow-up lands
// "Raw -> staged document conversion. Activity wiring lands in a follow-up PR."

// bad: dependency claim as documentation
// "Ingestion data contracts — pydantic + stdlib only."

// bad: doc on a constant
MAX_RETRIES = 5
// Maximum number of retries before giving up.

// bad: restates the signature
add(a: int, b: int) -> int
// Add two integers and return the result.

// good: public API doc carries non-signature behavior
getUserBalance(userId: string) -> Money
// Ledger lookup for checkout authorization; throws UserNotFound for unknown ids.

// good: private helper has no doc because the signature is sufficient
_roundHalfEven(value: Decimal) -> Decimal
```

### Code reads like prose

A reader should be able to skim top-to-bottom and follow the story. Order operations the way the reader thinks about them; name local variables after what they hold (`ranked_candidates`, not `result`; `normalized_rows`, not `temp`); let the structure of the code mirror the structure of the work. Complements **Names and types tell the story**: names carry the local contract at each signature; prose ordering carries the global narrative across statements.

```text
// good
candidates = fetchCandidates(query)
ranked = rankByRelevance(candidates)
topThree = ranked.slice(0, 3)
return topThree
```

### Blank lines separate logical phases

Within a function, use one blank line between distinct phases such as lookup, validation, branching, and return. Do not put a blank line immediately after the function signature or split one uninterrupted operation.

```text
// bad: signature separated from its body; validation and return run together
function resolveUser(userId: string) -> User {

  user = users.get(userId)
  if user is None { throw UserNotFound(userId) }
  return user
}

// good: lookup, validation, return
function resolveUser(userId: string) -> User {
  user = users.get(userId)

  if user is None { throw UserNotFound(userId) }

  return user
}
```

## Process

### Punchy

Load [Punchy](../../punchy/SKILL.md) for code comments, docs, commit messages, specifications, and reports.

### Minimal execution

Every line in the diff earns its slot. Priority stack (never invert): Correct → No new debt → Smallest surface. Audit diff before ship. Full discipline: [minimal-execution.md](minimal-execution.md).

### DRY — repetition is a red flag

Repeated logic with one authority and one reason to change will drift. Extract it when the shared ownership is real; similar-looking behavior with separate owners stays separate.

```text
// bad — same calculation in three files
total = subtotal * 1.0875   // (also in invoice, cart, receipt)

// good — one source of truth
total = applySalesTax(subtotal)
```

Before introducing a constant, magic string, path, or column name, search the existing settings / config module. Configuration values live in one place; if the value already exists, import it. New constants are a last resort, not a first reach.

Bind a settings getter's result to a local (`cfg = get_x_settings()`) instead of chaining the call inline across an expression — one call site, readable at every usage.

Two similar blocks with different owners are not duplication. A third occurrence is a strong prompt to re-check ownership, not an automatic abstraction trigger.

### No over-engineering

Solve the problem in front of you, not the problem you imagine in 18 months. Speculative abstractions, configuration knobs nobody uses, and "future-proof" generics are a tax on every reader until the future arrives — and usually it doesn't.

```text
// bad — generic factory for one concrete case
class WidgetFactoryRegistry { ... }

// good
makeWidget(spec)
```

### Fix linter smells structurally

Restructure wiring smells — don't suppress them with inline ignore comments. Side-effect imports for registration → explicit call from boot/startup hook.

```text
// bad — side-effect import masked with linter ignore
import "./wiringModule"   // linter: unused import

// good — explicit registration from startup/lifespan hook
wiringModule.registerResources()
```

### Minimum complexity

Of two designs that meet the requirements, prefer the one a new reader understands faster. Fewer abstractions, fewer indirection layers, fewer moving parts. Complexity must be earned by a concrete requirement, not assumed. Sister principle to **No over-engineering**: that one says don't add scope you don't have; this one says among designs that all meet your scope, pick the simplest.

```text
// bad — three-layer abstraction for a two-line job
strategy = StrategyResolver(StrategyConfig.default()).resolve("sum")
result = strategy.apply(values)

// good
result = sum(values)
```
