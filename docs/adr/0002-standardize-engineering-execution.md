# Standardize engineering execution

Code work follows `Orient → Decide → Plan → Implement → Verify`: resolve material decisions before code, plan the smallest production tracer and its target filesystem, implement through owning deep modules, then verify the decision as well as behavior. Repository ADRs own concrete architecture, and any implementation that contradicts or materially extends one must update or supersede it in the same PR.
