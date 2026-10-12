# API LombokRateLimit v0.1.0

Reference language: TypeScript. The Python port uses snake_case names and returns tuples, dicts, or dataclasses with the same content. Stability: 0.x; changes may occur and are noted in the CHANGELOG. Since version: 0.1.0.

- `new Gcra({limit, periodMs, burst}): check(nowMs, cost=1) -> Decision; isIdle(nowMs)`
- `new KeyedLimiter(cfg, maxKeys=100000, overflow='deny'): check(key, nowMs, cost); sweep(nowMs) -> removed; size`

Input outside the ranges in the SPEC raises `RangeError` (TypeScript) or `ValueError` (Python); functions defined as total return a special value (null, invalid) as the SPEC states.

Cross-language compatibility: see SPEC section 3 and the vectors.
