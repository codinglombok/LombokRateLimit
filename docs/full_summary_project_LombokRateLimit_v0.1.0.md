# Project Summary LombokRateLimit

## What it is

Deterministic rate limiting with the Generic Cell Rate Algorithm: per-key limiter, burst, variable cost, and retry-after hints; time is passed in explicitly. Part of the Lombok Ecosystem.

## Why it exists

A rate limiter that depends on the system clock is hard to test and behaves differently across languages. This library takes time as an input and uses pure integer arithmetic, so decisions are identical in every language and testable without waiting.

## Main features

- GCRA with burst and per-request cost
- Complete output: allowed, remaining, retryAfterMs, resetAfterMs
- Per-key limiter with a key cap and idle-key sweeping
- Overflow policy when the table is full: deny or allow
- No clock and no hidden allocation on the decision path

## Current status

Version 0.1.0, not yet released. TypeScript, Python and Go pass 2239 vector cases. No other ports exist.

## Example use cases

- API request limiting per client or token
- Limiting login attempts, email sending, or uploads
- Per-source packet limiting on a UDP or DNS server
- Rate control for sensor reads or commands in firmware

## Known Limitations

- nowMs*limit < 2^53 (use milliseconds since process start).
- Not thread-safe; callers serialize access.
- One algorithm (GCRA); explicit sliding-window and token-bucket: NOT YET.
- Rust and PHP ports: NOT YET.

## Further information

SPEC: `SPEC_LombokRateLimit_v0.1.0.md`; API: `API_LombokRateLimit_v0.1.0.md`; guide: `guide_how_to_use_LombokRateLimit_v0.1.0.md`.

## Gap versus comparable libraries

Comparable: governor (Rust), limiters in the Go ecosystem, rate-limiter-flexible (Node). Honest gap: no shared backend (such as Redis) and no benchmark yet; strength: determinism and identical results across languages.
