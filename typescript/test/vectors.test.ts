import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Gcra, KeyedLimiter } from "../src/index.ts";

const v = JSON.parse(readFileSync(new URL("../../vectors/lombokratelimit-vectors-v1.json", import.meta.url), "utf8"));
const dec = (s: Record<string, unknown>) => ({ allowed: s.allowed, remaining: s.remaining, retryAfterMs: s.retryAfterMs, resetAfterMs: s.resetAfterMs });

test("vector count >= 100", () => assert.ok(v.caseCount >= 100));
test("gcra", () => {
  for (const s of v.gcra) {
    const g = new Gcra(s.cfg);
    for (const st of s.steps) assert.deepEqual(g.check(st.t, st.cost), dec(st), JSON.stringify(st));
  }
});
test("keyed", () => {
  for (const s of v.keyed) {
    const k = new KeyedLimiter(s.cfg, s.maxKeys, s.overflow);
    for (const st of s.steps) {
      if ("sweep" in st) {
        assert.equal(k.sweep(st.sweep), st.removed);
      } else {
        assert.deepEqual(k.check(st.key, st.t, st.cost), dec(st), JSON.stringify(st));
      }
      assert.equal(k.size, st.size);
    }
  }
});
test("invalid config and input throw", () => {
  assert.throws(() => new Gcra({ limit: 0, periodMs: 1, burst: 1 }));
  assert.throws(() => new Gcra({ limit: 1.5, periodMs: 1, burst: 1 }));
  assert.throws(() => new Gcra({ limit: 1, periodMs: 1, burst: 0 }));
  assert.throws(() => new Gcra({ limit: 1, periodMs: 1, burst: 1 }).check(-1));
  assert.throws(() => new Gcra({ limit: 1_000_000, periodMs: 1, burst: 1 }).check(2 ** 40));
  assert.throws(() => new Gcra({ limit: 2, periodMs: 1, burst: 1 }).check(2 ** 52));
  assert.ok(new Gcra({ limit: 2, periodMs: 1, burst: 1 }).check(2 ** 52 - 1).allowed);
});
