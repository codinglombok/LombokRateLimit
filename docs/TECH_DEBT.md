# Tech Debt LombokRateLimit

| ID | Priority | Finding | Fix |
|---|---|---|---|
| TD-01 | P0 | GitHub CI has never run; actions are not pinned to a SHA | Add a caller for lombok-ci.yml |
| TD-02 | P0 | `lombok doctor docs/privacy/style` does not exist yet | Run it once available (ecosystem TD-P0-08) |
| TD-03 | P1 | Rust and PHP ports do not exist; Rust is the no_std reference | Add the ports and vector runners |
| TD-04 | P1 | Coverage and fuzzing are not measured | Add coverage and fuzz jobs |
| TD-05 | P2 | The 12 standard documents come from a local generator, not the central templates (`codinglombok/.github` does not exist yet) | Move to the central render_docs.py and review the content |
| TD-06 | P2 | Vectors are generated from the TypeScript reference; expected values are not independent | Manually review a sample of vectors |
| TD-07 | P2 | tsc build, npm pack --dry-run, python -m build and twine check pass locally but are not run in CI; README and licenses are copied into python/ and typescript/ by the generator | Run them in CI and build from the repository root |
