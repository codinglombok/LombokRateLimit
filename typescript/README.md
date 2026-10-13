# LombokRateLimit

Deterministic rate limiting with the Generic Cell Rate Algorithm: per-key limiter, burst, variable cost, and retry-after hints; time is passed in explicitly. Part of the Lombok Ecosystem.

## Why this library?

A rate limiter that depends on the system clock is hard to test and behaves differently across languages. This library takes time as an input and uses pure integer arithmetic, so decisions are identical in every language and testable without waiting.

## Features

- GCRA with burst and per-request cost
- Complete output: allowed, remaining, retryAfterMs, resetAfterMs
- Per-key limiter with a key cap and idle-key sweeping
- Overflow policy when the table is full: deny or allow
- No clock and no hidden allocation on the decision path

## Use cases

- API request limiting per client or token
- Limiting login attempts, email sending, or uploads
- Per-source packet limiting on a UDP or DNS server
- Rate control for sensor reads or commands in firmware

## Installation

Not yet published to any registry (0.1.0 has not been released). After release:

```
npm install lombokratelimit
pip install lombokratelimit
```

## API overview

- `new Gcra({limit, periodMs, burst}): check(nowMs, cost=1) -> Decision; isIdle(nowMs)`
- `new KeyedLimiter(cfg, maxKeys=100000, overflow='deny'): check(key, nowMs, cost); sweep(nowMs) -> removed; size`

Details: `docs/API_LombokRateLimit_v0.1.0.md`.

## Port status

| Port | Status |
|---|---|
| TypeScript (reference) | YES, passes all 2239 vector cases |
| Python | YES, passes all 2239 vector cases |
| Rust, Go, PHP | NOT YET |

## Standards implemented

The normative contract is in `docs/SPEC_LombokRateLimit_v0.1.0.md`; the vectors are in `vectors/lombokratelimit-vectors-v1.json`.

## Known limitations

- nowMs*limit < 2^53 (use milliseconds since process start).
- Not thread-safe; callers serialize access.
- One algorithm (GCRA); explicit sliding-window and token-bucket: NOT YET.
- Rust, Go and PHP ports: NOT YET.

## Development

```
node --test typescript/test/vectors.test.ts   # TypeScript (Node 22+)
python -m pytest python/tests                 # Python 3.10+
node scripts/gen_vectors.ts                   # regenerate vectors from the TypeScript reference
```

## Lombok Ecosystem

Part of the [Lombok Ecosystem](https://github.com/codinglombok).

## License

Apache-2.0 OR MIT (see `LICENSE-APACHE` and `LICENSE-MIT`).
