export interface GcraConfig {
  /** peristiwa yang diizinkan per periode (bilangan bulat 1..1_000_000) */
  limit: number;
  /** panjang periode dalam milidetik (bilangan bulat >= 1) */
  periodMs: number;
  /** kapasitas lonjakan dalam peristiwa (bilangan bulat >= 1) */
  burst: number;
}
export interface Decision {
  allowed: boolean;
  /** sisa peristiwa yang dapat langsung diterima setelah keputusan ini */
  remaining: number;
  /** ms sampai permintaan sebesar `cost` diterima; 0 bila diizinkan; -1 bila cost > burst */
  retryAfterMs: number;
  /** ms sampai kapasitas penuh kembali */
  resetAfterMs: number;
}

function divFloor(a: number, b: number): number {
  return (a - (a % b)) / b;
}
function divCeil(a: number, b: number): number {
  return divFloor(a + b - 1, b);
}
function checkConfig(c: GcraConfig): void {
  for (const [k, v, max] of [["limit", c.limit, 1_000_000], ["periodMs", c.periodMs, 2 ** 31], ["burst", c.burst, 2 ** 31]] as const) {
    if (!Number.isInteger(v) || v < 1 || v > max) throw new RangeError(`${k} out of range`);
  }
}

/**
 * Generic Cell Rate Algorithm. Waktu dilewatkan eksplisit (ms bilangan bulat, tidak turun);
 * syarat: nowMs * limit < 2^53. Seluruh aritmetika bilangan bulat, identik lintas bahasa.
 */
export class Gcra {
  private tat = 0; // dalam satuan ms * limit
  private readonly cfg: GcraConfig;
  constructor(cfg: GcraConfig) {
    checkConfig(cfg);
    this.cfg = { limit: cfg.limit, periodMs: cfg.periodMs, burst: cfg.burst };
  }

  check(nowMs: number, cost = 1): Decision {
    const { limit, periodMs: T, burst } = this.cfg;
    if (!Number.isInteger(nowMs) || nowMs < 0 || nowMs * limit >= 2 ** 53) throw new RangeError("nowMs out of range");
    if (!Number.isInteger(cost) || cost < 0 || cost > 2 ** 31) throw new RangeError("cost out of range");
    const now = nowMs * limit;
    const cap = burst * T;
    const base = Math.max(this.tat, now);
    const next = base + cost * T;
    const allowed = next - now <= cap;
    if (allowed) this.tat = next;
    const cur = Math.max(this.tat - now, 0);
    const remaining = divFloor(cap - cur, T);
    const wait = allowed ? 0 : cost > burst ? -1 : divCeil(next - now - cap, limit);
    return { allowed, remaining, retryAfterMs: wait, resetAfterMs: divCeil(cur, limit) };
  }

  /** true bila kapasitas penuh pada waktu now (aman dibuang dari tabel kunci) */
  isIdle(nowMs: number): boolean {
    return this.tat <= nowMs * this.cfg.limit;
  }
}

export type Overflow = "deny" | "allow";

/** Pembatas per kunci dengan batas jumlah kunci; kunci idle dibuang oleh sweep(). */
export class KeyedLimiter {
  private map = new Map<string, Gcra>();
  private readonly cfg: GcraConfig;
  private readonly maxKeys: number;
  private readonly overflow: Overflow;
  constructor(cfg: GcraConfig, maxKeys = 100_000, overflow: Overflow = "deny") {
    checkConfig(cfg);
    if (!Number.isInteger(maxKeys) || maxKeys < 1) throw new RangeError("maxKeys out of range");
    this.cfg = { limit: cfg.limit, periodMs: cfg.periodMs, burst: cfg.burst };
    this.maxKeys = maxKeys;
    this.overflow = overflow;
  }

  get size(): number {
    return this.map.size;
  }

  check(key: string, nowMs: number, cost = 1): Decision {
    let g = this.map.get(key);
    if (!g) {
      if (this.map.size >= this.maxKeys) this.sweep(nowMs);
      if (this.map.size >= this.maxKeys) {
        const ok = this.overflow === "allow";
        return { allowed: ok, remaining: 0, retryAfterMs: 0, resetAfterMs: 0 };
      }
      g = new Gcra(this.cfg);
      this.map.set(key, g);
    }
    return g.check(nowMs, cost);
  }

  /** buang kunci idle; kembalikan jumlah yang dibuang */
  sweep(nowMs: number): number {
    let n = 0;
    for (const [k, g] of [...this.map]) {
      if (g.isIdle(nowMs)) {
        this.map.delete(k);
        n++;
      }
    }
    return n;
  }
}
