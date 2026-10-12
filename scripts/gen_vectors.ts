import { writeFileSync } from "node:fs";
import { Gcra, KeyedLimiter, type GcraConfig } from "../typescript/src/index.ts";

type Op = { t: number; cost?: number };
const seqs: { cfg: GcraConfig; ops: Op[] }[] = [];
const ramp = (n: number, step: number, start = 0): Op[] => Array.from({ length: n }, (_, i) => ({ t: start + i * step }));
// 1000/s with burst 1000 (typical per-client limit)
seqs.push({ cfg: { limit: 1000, periodMs: 1000, burst: 1000 }, ops: ramp(1100, 0) });
seqs.push({ cfg: { limit: 1000, periodMs: 1000, burst: 1000 }, ops: [...ramp(1000, 0), { t: 1 }, { t: 1 }, { t: 2 }, { t: 1000 }, { t: 2000 }] });
// 1 per second, burst 1
seqs.push({ cfg: { limit: 1, periodMs: 1000, burst: 1 }, ops: [0, 0, 500, 999, 1000, 1001, 1999, 2000, 5000, 5000].map((t) => ({ t })) });
// 5 per 10 seconds, burst 3
seqs.push({ cfg: { limit: 5, periodMs: 10000, burst: 3 }, ops: ramp(12, 100).concat(ramp(6, 2000, 3000)) });
// biaya variabel
seqs.push({ cfg: { limit: 10, periodMs: 1000, burst: 10 }, ops: [{ t: 0, cost: 4 }, { t: 0, cost: 4 }, { t: 0, cost: 4 }, { t: 0, cost: 2 }, { t: 0, cost: 11 }, { t: 0, cost: 0 }, { t: 700, cost: 7 }, { t: 700, cost: 1 }, { t: 5000, cost: 10 }, { t: 5000, cost: 1 }] });
// rate that does not divide evenly: 3 per 1000 ms
seqs.push({ cfg: { limit: 3, periodMs: 1000, burst: 2 }, ops: ramp(20, 150) });
seqs.push({ cfg: { limit: 7, periodMs: 100, burst: 1 }, ops: ramp(25, 7) });
seqs.push({ cfg: { limit: 1_000_000, periodMs: 1000, burst: 5 }, ops: [{ t: 0 }, { t: 0 }, { t: 0 }, { t: 0 }, { t: 0 }, { t: 0 }, { t: 1 }, { t: 1 }, { t: 1_000_000 }] });
seqs.push({ cfg: { limit: 2, periodMs: 1, burst: 1 }, ops: [0, 0, 0, 1, 1, 2, 3, 3].map((t) => ({ t })) });

const gcra = seqs.map((s) => {
  const g = new Gcra(s.cfg);
  return { cfg: s.cfg, steps: s.ops.map((o) => ({ t: o.t, cost: o.cost ?? 1, ...g.check(o.t, o.cost ?? 1) })) };
});

type KOp = { key: string; t: number; cost?: number } | { sweep: number };
const kcfg: GcraConfig = { limit: 2, periodMs: 1000, burst: 2 };
const kseqs: { maxKeys: number; overflow: "deny" | "allow"; ops: KOp[] }[] = [
  {
    maxKeys: 2, overflow: "deny",
    ops: [
      { key: "a", t: 0 }, { key: "b", t: 0 }, { key: "c", t: 0 }, { key: "a", t: 0 }, { key: "a", t: 0 }, { key: "c", t: 100 },
      { sweep: 100 }, { sweep: 5000 }, { key: "c", t: 5000 }, { key: "d", t: 5000 }, { key: "e", t: 5000 },
    ],
  },
  {
    maxKeys: 1, overflow: "allow",
    ops: [{ key: "x", t: 0 }, { key: "y", t: 0 }, { key: "y", t: 1 }, { key: "x", t: 1 }, { key: "x", t: 1 }, { key: "y", t: 10_000 }],
  },
  { maxKeys: 3, overflow: "deny", ops: [{ key: "a", t: 0 }, { key: "b", t: 0 }, { key: "c", t: 0 }, { key: "d", t: 0 }, { key: "a", t: 0 }, { sweep: 499 }, { sweep: 500 }, { key: "d", t: 500 }] },
  { maxKeys: 5, overflow: "deny", ops: [{ key: "a", t: 0 }, { key: "b", t: 10000 }, { key: "c", t: 10000 }] },
  { maxKeys: 100, overflow: "deny", ops: [{ key: "", t: 0 }, { key: "k", t: 0 }, { key: "k", t: 0 }, { key: "k", t: 0 }, { sweep: 0 }, { sweep: 9999 }] },
];
const keyed = kseqs.map((s) => {
  const k = new KeyedLimiter(kcfg, s.maxKeys, s.overflow);
  const steps = s.ops.map((o) => {
    if ("sweep" in o) return { sweep: o.sweep, removed: k.sweep(o.sweep), size: k.size };
    return { key: o.key, t: o.t, cost: o.cost ?? 1, ...k.check(o.key, o.t, o.cost ?? 1), size: k.size };
  });
  return { cfg: kcfg, maxKeys: s.maxKeys, overflow: s.overflow, steps };
});
const caseCount = gcra.reduce((a, s) => a + s.steps.length, 0) + keyed.reduce((a, s) => a + s.steps.length, 0);
writeFileSync(new URL("../vectors/lombokratelimit-vectors-v1.json", import.meta.url), JSON.stringify({ version: 1, caseCount, gcra, keyed }, null, 1) + "\n");
console.log("cases", caseCount);
