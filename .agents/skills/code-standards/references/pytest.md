# Pytest Standards

Repository package layout, pytest configuration, async support, and event-loop scope are authoritative. Tests import through the production package contract; changing `sys.path` or `PYTHONPATH` to make imports pass hides packaging defects.

## Fixtures and cleanup

Keep a fixture beside its nearest real owner: local test module first, then the nearest `conftest.py` after reuse. Default to function scope and explicit parameters. Use `autouse` only for a genuine invariant of every test in that scope.

Register cleanup immediately after each state-changing setup step succeeds so later setup failure cannot skip it. Prefer `yield` for one acquired resource and `request.addfinalizer` or an `ExitStack` when acquisition is incremental.

Fixtures return fresh mutable state. A broader scope earns explicit proof that shared state is immutable, reset safely, or intentionally shared.

## Parameterization

Use `@pytest.mark.parametrize` when rows exercise one behavior contract with different inputs and expected outcomes. Give opaque cases stable IDs. Construct mutable case values per invocation through a fixture, factory, or indirect parameter instead of sharing objects created at collection time.

## Built-in intent map

| Need | Prefer |
|---|---|
| Isolated filesystem | `tmp_path` / `tmp_path_factory` |
| Replace an attribute or environment value | `monkeypatch` |
| Observe logs | `caplog` |
| Observe stdout/stderr | `capsys` or `capfd` |
| Stable warnings contract | `pytest.warns` |
| Cleanup registration | `request.addfinalizer` |

Use these built-ins before a plugin or custom helper. A hook or new plugin requires a demonstrated suite-infrastructure need; do not add one as a convenience catalog choice.

## Patching

Patch the binding consumed by the subject, which may differ from where the object was defined. Prefer a real lightweight object or small fake when its state makes the assertion clearer.

Use `autospec` or `spec_set` when interface drift is a material risk. Use `AsyncMock` for an awaited contract. Otherwise keep the patch minimal; call order and counts remain assertions only when observable behavior depends on them.

## Outcomes

- Use `pytest.raises` for the stable exception type and only the stable domain message or code.
- Use `pytest.approx` only where numerical tolerance is part of the contract; choose an explicit tolerance when the default does not express it.
- Skip only when an explicitly declared optional capability is absent. An unavailable required dependency fails setup or becomes reported residual risk.
- Mark a confirmed, owned defect `xfail(strict=True)` with a reason and issue locator; an unexpected pass must fail so the marker is removed.

## Markers and environment

Custom markers are repository-owned vocabulary. Register them in the existing pytest configuration and enable the pinned pytest version's supported strict-marker setting so unknown markers fail. Environment-dependent markers name the external dependency and remain distinct from ordinary hermetic tests.

Use the repository's async support and loop-scope policy. Missing async support is a repository dependency decision, not a test-local workaround.

## Parallel execution

Establish serial correctness first. Parallel-safe tests isolate mutable state, namespace external resources by worker, and clean up only what they own. Enable parallel execution only after measurement shows a useful improvement; ordering-dependent failures remain defects.
