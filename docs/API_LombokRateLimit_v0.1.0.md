# API LombokRateLimit v0.1.0

Bahasa referensi: TypeScript. Port Python memakai penamaan snake_case dan mengembalikan tuple atau dataclass dengan isi yang sama. Stabilitas: 0.x, perubahan dapat terjadi dengan catatan di CHANGELOG. Sejak versi: 0.1.0.

- `new Gcra({limit, periodMs, burst}): check(nowMs, cost=1) -> Decision; isIdle(nowMs)`
- `new KeyedLimiter(cfg, maxKeys=100000, overflow='deny'): check(key, nowMs, cost); sweep(nowMs) -> removed; size`

Kesalahan masukan di luar rentang SPEC memicu `RangeError` (TypeScript) atau `ValueError` (Python); fungsi yang didefinisikan total mengembalikan nilai khusus (null, invalid) sesuai SPEC.

Kompatibilitas lintas bahasa: lihat SPEC bagian 3 dan vector.
