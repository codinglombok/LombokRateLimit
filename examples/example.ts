import { KeyedLimiter } from "../typescript/src/index.ts";

// 5 permintaan per detik per klien, lonjakan 5
const rl = new KeyedLimiter({ limit: 5, periodMs: 1000, burst: 5 });
for (let i = 0; i < 7; i++) {
  const d = rl.check("client-a", 0);
  console.log(i, d.allowed, "remaining", d.remaining, "retryAfterMs", d.retryAfterMs);
}
console.log("t=200", rl.check("client-a", 200).allowed);
