# Development LombokRateLimit

## 1. Roadmap

- 0.1.1: CI, coverage, fuzz, publish
- 0.2.0: Rust (no_std), Go, PHP ports; benchmark
- 0.3.0: explicit sliding-window and token-bucket algorithms

## 2. Deferred scope

Distributed limiting, storage outside memory, and a monotonic clock are the caller's responsibility.

## 3. Design principles for contributors

- Contract first: change the SPEC and vectors before the code; differences between ports are bugs.
- No runtime dependencies; no clock, no network, no hidden randomness.
- Every README feature has a vector case or a test.
- No client or owning-application names in public files.
- No emoji in `*.md`.
- Documentation, comments, error messages and examples are written in English (the default language of all Lombok Ecosystem repositories).

## 4. How to contribute

Fork, create a `feat/...` branch, run both vector runners, update `API_` and `SPEC_` if behavior changes, and open a PR. Regenerate vectors with `node scripts/gen_vectors.ts` only when the contract changes, and review the vector diff.

## 5. Open questions

- Is a thread-safe variant needed in Rust?
- Is an interface for saving state (snapshots) to external storage needed?
