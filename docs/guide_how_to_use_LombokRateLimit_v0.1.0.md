# Usage Guide LombokRateLimit

## 1. Installation

After release: `npm install lombokratelimit` or `pip install lombokratelimit`. Before release, copy the `typescript/src` folder or `python/src/lombokratelimit` (no dependencies).

## 2. Basic concepts

Gcra decides one request based on the time you supply (integer ms). KeyedLimiter keeps one Gcra per key and drops idle keys via sweep. A decision contains allowed, remaining, retryAfterMs, resetAfterMs.

## 3. Examples

`examples/example.ts` and `examples/example.py` produce the following output (TypeScript; Python is identical except for print formatting):

```
0 true remaining 4 retryAfterMs 0
1 true remaining 3 retryAfterMs 0
2 true remaining 2 retryAfterMs 0
3 true remaining 1 retryAfterMs 0
4 true remaining 0 retryAfterMs 0
5 false remaining 0 retryAfterMs 200
6 false remaining 0 retryAfterMs 200
t=200 true
```

TypeScript code:

```ts
import { KeyedLimiter } from "lombokratelimit";

// 5 requests per second per client, burst of 5
const rl = new KeyedLimiter({ limit: 5, periodMs: 1000, burst: 5 });
for (let i = 0; i < 7; i++) {
  const d = rl.check("client-a", 0);
  console.log(i, d.allowed, "remaining", d.remaining, "retryAfterMs", d.retryAfterMs);
}
console.log("t=200", rl.check("client-a", 200).allowed);
```

## 4. Recipes

- Response header: send retryAfterMs divided by one thousand (rounded up) as Retry-After.
- Server with a large table: call sweep(now) periodically so idle keys are dropped.
- Different costs: pass a larger cost for expensive operations.

## 5. Common pitfalls

- nowMs*limit < 2^53 (use milliseconds since process start).
- Not thread-safe; callers serialize access.
- One algorithm (GCRA); explicit sliding-window and token-bucket: NOT YET.
- Rust, Go and PHP ports: NOT YET.

## 6. See also

`SPEC_LombokRateLimit_v0.1.0.md`, `API_LombokRateLimit_v0.1.0.md`, `full_summary_project_LombokRateLimit_v0.1.0.md`.
