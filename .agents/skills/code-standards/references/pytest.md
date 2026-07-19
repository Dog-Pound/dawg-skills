# Pytest Standards

Follow the repository's test layout and markers. When no convention exists:

- use `@pytest.mark.parametrize` for repeated input/output cases;
- put shared setup in the nearest owning `conftest.py`;
- use `tmp_path` for filesystem tests;
- use `pytest.raises(..., match=...)` when the error is the behavior; and
- register custom markers in `pyproject.toml`.

Use the repository's async test support; add `pytest-asyncio` only when async tests require it.
