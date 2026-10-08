# Ringkasan Proyek LombokRateLimit

## Apa ini

Deterministic rate limiting with the Generic Cell Rate Algorithm: per-key limiter, burst, variable cost, and retry-after hints; time is passed in explicitly. Part of the Lombok Ecosystem.

## Mengapa dibuat

Pembatas laju yang bergantung pada jam sistem sulit diuji dan berbeda perilaku antar bahasa. Library ini menerima waktu sebagai masukan dan memakai aritmetika bilangan bulat murni, sehingga keputusan identik di setiap bahasa dan dapat diuji tanpa menunggu.

## Fitur utama

- GCRA dengan lonjakan (burst) dan biaya per permintaan
- Keluaran lengkap: diizinkan, sisa, retryAfterMs, resetAfterMs
- Pembatas per kunci dengan batas jumlah kunci dan pembersihan kunci idle
- Kebijakan saat tabel penuh: deny atau allow
- Tanpa jam, tanpa alokasi tersembunyi di jalur keputusan

## Status saat ini

Versi 0.1.0, belum dirilis. TypeScript dan Python lulus 2239 kasus vector. Port lain belum ada.

## Contoh pemakai

- Pembatas permintaan API per klien atau per token
- Pembatas percobaan login, pengiriman email, atau unggahan
- Pembatas paket per sumber pada server UDP/DNS
- Pengatur laju pembacaan sensor atau perintah pada firmware

## Batasan yang Diketahui

- Batas nowMs*limit < 2^53 (gunakan ms sejak awal proses).
- Tidak aman antar-thread; pemanggil menyerialisasi akses.
- Satu algoritma (GCRA); sliding-window dan token-bucket eksplisit BELUM.
- Port Rust, Go, PHP BELUM.

## Info lanjut

SPEC: `SPEC_LombokRateLimit_v0.1.0.md`; API: `API_LombokRateLimit_v0.1.0.md`; panduan: `guide_how_to_use_LombokRateLimit_v0.1.0.md`.

## Gap vs pembanding

Pembanding: governor (Rust), limiter pada ekosistem Go, rate-limiter-flexible (Node). Gap jujur: tidak ada backend bersama (Redis) dan belum ada benchmark; keunggulan: determinisme dan hasil identik lintas bahasa.
