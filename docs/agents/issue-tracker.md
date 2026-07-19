# Issue tracker: GitHub

Issues and PRDs live as GitHub issues and are tracked in [DPS Planning](https://github.com/orgs/Dog-Pound/projects/2). Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Add it to DPS Planning**: `gh project item-add 2 --owner Dog-Pound --url "<issue-url>"`
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply or remove labels**: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v`; `gh` does this automatically inside a clone.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>`.
- **List external PRs for triage**: `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments`, then keep only `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, or `NONE`.
- **Comment, label, or close**: `gh pr comment`, `gh pr edit --add-label` or `--remove-label`, and `gh pr close`.

GitHub shares one number space across issues and PRs. Resolve a bare `#42` with `gh pr view 42`, then fall back to `gh issue view 42`.

## When a skill says “publish to the issue tracker”

Create a GitHub issue and add it to DPS Planning.

## When a skill says “fetch the relevant ticket”

Run `gh issue view <number> --comments`.

## Wayfinding operations

The map is one issue with child issues as tickets.

- **Map**: an issue labelled `wayfinder:map`, holding the Notes, Decisions-so-far, and Fog body.
- **Child ticket**: an issue linked as a GitHub sub-issue. If unavailable, add it to the map’s task list and put `Part of #<map>` at the top. Label it `wayfinder:<type>` (`research`, `prototype`, `grilling`, or `task`).
- **Blocking**: use GitHub’s native issue dependencies. Fall back to a `Blocked by: #<n>` line when unavailable.
- **Frontier query**: choose the first open, unassigned child without an open blocker.
- **Claim**: `gh issue edit <n> --add-assignee @me`
- **Resolve**: comment with the answer, close the ticket, then append its context pointer to the map’s Decisions-so-far.
