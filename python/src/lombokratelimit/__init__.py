from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class GcraConfig:
    limit: int
    period_ms: int
    burst: int


@dataclass(frozen=True)
class Decision:
    allowed: bool
    remaining: int
    retry_after_ms: int
    reset_after_ms: int


def _check_config(c: GcraConfig) -> None:
    for name, v, mx in (("limit", c.limit, 1_000_000), ("period_ms", c.period_ms, 2**31), ("burst", c.burst, 2**31)):
        if not isinstance(v, int) or isinstance(v, bool) or v < 1 or v > mx:
            raise ValueError(f"{name} out of range")


def _ceil(a: int, b: int) -> int:
    return (a + b - 1) // b


class Gcra:
    def __init__(self, cfg: GcraConfig) -> None:
        _check_config(cfg)
        self._cfg = cfg
        self._tat = 0

    def check(self, now_ms: int, cost: int = 1) -> Decision:
        c = self._cfg
        if not isinstance(now_ms, int) or now_ms < 0 or now_ms * c.limit >= 2**53:
            raise ValueError("now_ms out of range")
        if not isinstance(cost, int) or cost < 0 or cost > 2**31:
            raise ValueError("cost out of range")
        now = now_ms * c.limit
        cap = c.burst * c.period_ms
        nxt = max(self._tat, now) + cost * c.period_ms
        allowed = nxt - now <= cap
        if allowed:
            self._tat = nxt
        cur = max(self._tat - now, 0)
        remaining = (cap - cur) // c.period_ms
        if allowed:
            wait = 0
        elif cost > c.burst:
            wait = -1
        else:
            wait = _ceil(nxt - now - cap, c.limit)
        return Decision(allowed, remaining, wait, _ceil(cur, c.limit))

    def is_idle(self, now_ms: int) -> bool:
        return self._tat <= now_ms * self._cfg.limit


class KeyedLimiter:
    def __init__(self, cfg: GcraConfig, max_keys: int = 100_000, overflow: str = "deny") -> None:
        _check_config(cfg)
        if max_keys < 1:
            raise ValueError("max_keys out of range")
        self._cfg, self._max, self._overflow = cfg, max_keys, overflow
        self._map: dict[str, Gcra] = {}

    @property
    def size(self) -> int:
        return len(self._map)

    def check(self, key: str, now_ms: int, cost: int = 1) -> Decision:
        g = self._map.get(key)
        if g is None:
            if len(self._map) >= self._max:
                self.sweep(now_ms)
            if len(self._map) >= self._max:
                return Decision(self._overflow == "allow", 0, 0, 0)
            g = Gcra(self._cfg)
            self._map[key] = g
        return g.check(now_ms, cost)

    def sweep(self, now_ms: int) -> int:
        dead = [k for k, g in self._map.items() if g.is_idle(now_ms)]
        for k in dead:
            del self._map[k]
        return len(dead)
