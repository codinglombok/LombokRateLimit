# Panduan Pemakaian LombokRateLimit

## 1. Instalasi

Setelah rilis: `npm install lombokratelimit` atau `pip install lombokratelimit`. Sebelum rilis, salin folder `typescript/src` atau `python/src/lombokratelimit` (tanpa dependensi).

## 2. Konsep dasar

Gcra memutuskan satu permintaan berdasarkan waktu yang Anda berikan (ms bilangan bulat). KeyedLimiter menyimpan satu Gcra per kunci dan membuang kunci yang sudah idle lewat sweep. Keputusan memuat allowed, remaining, retryAfterMs, resetAfterMs.

## 3. Contoh

Berkas `examples/example.ts` dan `examples/example.py` menghasilkan keluaran berikut (TypeScript; Python sama kecuali format cetak):

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

Kode TypeScript:

```ts
import { KeyedLimiter } from "lombokratelimit";

// 5 permintaan per detik per klien, lonjakan 5
const rl = new KeyedLimiter({ limit: 5, periodMs: 1000, burst: 5 });
for (let i = 0; i < 7; i++) {
  const d = rl.check("client-a", 0);
  console.log(i, d.allowed, "remaining", d.remaining, "retryAfterMs", d.retryAfterMs);
}
console.log("t=200", rl.check("client-a", 200).allowed);
```

## 4. Recipes

- Header respons: kirim retryAfterMs dibagi seribu (dibulatkan ke atas) sebagai Retry-After.
- Server dengan tabel besar: panggil sweep(now) secara berkala agar kunci idle dibuang.
- Biaya berbeda: beri cost lebih besar untuk operasi mahal.

## 5. Common pitfalls

- Batas nowMs*limit < 2^53 (gunakan ms sejak awal proses).
- Tidak aman antar-thread; pemanggil menyerialisasi akses.
- Satu algoritma (GCRA); sliding-window dan token-bucket eksplisit BELUM.
- Port Rust, Go, PHP BELUM.

## 6. Lihat juga

`SPEC_LombokRateLimit_v0.1.0.md`, `API_LombokRateLimit_v0.1.0.md`, `full_summary_project_LombokRateLimit_v0.1.0.md`.
