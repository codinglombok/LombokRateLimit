# Lang LombokRateLimit

## 1. Tingkat i18n

Tingkat E (pesan error dan dokumentasi saja). Library tidak menampilkan teks ke pengguna akhir.

## 2. Katalog ID pesan

Belum ada katalog `locales/`. Galat memakai jenis standar bahasa (RangeError/ValueError) dengan nama argumen sebagai pesan teknis berbahasa Inggris. ID pesan kanonik direncanakan di 0.2.0 bila LombokLocale menjadi dependensi opsional.

## 3. Cakupan Core-20 dan Nusantara

Cakupan saat ini: 0 dari 20 (tidak ada pesan untuk diterjemahkan). Dokumentasi: Indonesia.

## 4. Cara menambah bahasa

Setelah katalog ada: tambahkan `locales/<bcp47>/lombokratelimit.json` dan perbarui tabel cakupan.

## 5. Ketergantungan LombokLocale

Tidak ada (opsional di masa depan).
