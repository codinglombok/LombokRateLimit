# LombokRateLimit

Deterministic rate limiting with the Generic Cell Rate Algorithm: per-key limiter, burst, variable cost, and retry-after hints; time is passed in explicitly. Part of the Lombok Ecosystem.

## Mengapa library ini?

Pembatas laju yang bergantung pada jam sistem sulit diuji dan berbeda perilaku antar bahasa. Library ini menerima waktu sebagai masukan dan memakai aritmetika bilangan bulat murni, sehingga keputusan identik di setiap bahasa dan dapat diuji tanpa menunggu.

## Fitur

- GCRA dengan lonjakan (burst) dan biaya per permintaan
- Keluaran lengkap: diizinkan, sisa, retryAfterMs, resetAfterMs
- Pembatas per kunci dengan batas jumlah kunci dan pembersihan kunci idle
- Kebijakan saat tabel penuh: deny atau allow
- Tanpa jam, tanpa alokasi tersembunyi di jalur keputusan

## Skenario pemakaian

- Pembatas permintaan API per klien atau per token
- Pembatas percobaan login, pengiriman email, atau unggahan
- Pembatas paket per sumber pada server UDP/DNS
- Pengatur laju pembacaan sensor atau perintah pada firmware

## Instalasi

Belum terbit di registry (0.1.0 belum dirilis). Setelah rilis:

```
npm install lombokratelimit
pip install lombokratelimit
```

## API ringkas

- `new Gcra({limit, periodMs, burst}): check(nowMs, cost=1) -> Decision; isIdle(nowMs)`
- `new KeyedLimiter(cfg, maxKeys=100000, overflow='deny'): check(key, nowMs, cost); sweep(nowMs) -> removed; size`

Rincian: `docs/API_LombokRateLimit_v0.1.0.md`.

## Status port

| Port | Status |
|---|---|
| TypeScript (referensi) | YA, lulus seluruh 2239 kasus vector |
| Python | YA, lulus seluruh 2239 kasus vector |
| Rust, Go, PHP | BELUM |

## Standar yang diimplementasikan

Kontrak normatif ada di `docs/SPEC_LombokRateLimit_v0.1.0.md`; vector di `vectors/lombokratelimit-vectors-v1.json`.

## Batasan yang diketahui

- Batas nowMs*limit < 2^53 (gunakan ms sejak awal proses).
- Tidak aman antar-thread; pemanggil menyerialisasi akses.
- Satu algoritma (GCRA); sliding-window dan token-bucket eksplisit BELUM.
- Port Rust, Go, PHP BELUM.

## Pengembangan

```
node --test typescript/test/          # TypeScript (Node 22+)
python -m pytest python/tests         # Python 3.10+
node scripts/gen_vectors.ts           # membangkitkan ulang vector dari referensi TypeScript
```

## Ekosistem Lombok

Part of the [Lombok Ecosystem](https://github.com/codinglombok).

## Lisensi

Apache-2.0 OR MIT (lihat `LICENSE-APACHE` dan `LICENSE-MIT`).
