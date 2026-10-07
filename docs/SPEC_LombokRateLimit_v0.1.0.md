# SPEC LombokRateLimit v0.1.0

This document is the normative cross-language contract. Every language port MUST produce byte-identical output for all specified inputs. Deviations from this specification are bugs.

Kata MUST, SHOULD, dan MAY dibaca sesuai RFC 2119. Tinjauan terakhir: 2026-10-07.

## 0. Standar acuan

Library ini mendefinisikan kontraknya sendiri; tidak ada standar eksternal normatif kecuali yang disebut pada bagian terkait.

## 1. Vector

| Berkas | Kasus | SHA-256 |
|---|---|---|
| `vectors/lombokratelimit-vectors-v1.json` | 2239 | `d7ce95312decf2f3167fc45938eb5233bbc223eea1cb5882dcbb191a44f93b01` |

## 2. Kontrak

1. Satuan internal adalah ms dikalikan limit. T = periodMs, kapasitas = burst*T. Untuk permintaan bernilai cost: next = max(tat, now) + cost*T; diizinkan bila next - now <= kapasitas; bila diizinkan tat = next.
2. remaining = floor((kapasitas - max(tat - now, 0)) / T) setelah keputusan. resetAfterMs = ceil(max(tat - now, 0) / limit).
3. retryAfterMs = 0 bila diizinkan; -1 bila cost > burst; selain itu ceil((next - now - kapasitas) / limit).
4. Syarat masukan: limit 1..1000000; periodMs dan burst 1..2^31; nowMs bilangan bulat >= 0 dan nowMs*limit < 2^53; cost 0..2^31. Pelanggaran memicu error RangeError/ValueError.
5. Waktu tidak boleh mundur untuk satu pembatas; perilaku bila mundur tidak ditentukan.
6. KeyedLimiter: kunci baru saat tabel penuh memicu sweep; bila masih penuh keputusan tetap {allowed = (overflow == allow), remaining 0, retryAfterMs 0, resetAfterMs 0} tanpa membuat kunci. sweep membuang kunci yang tat <= now dan mengembalikan jumlahnya.

## 3. Representasi lintas bahasa

Indeks dan panjang string dihitung per code point; angka floating point memakai IEEE 754 double dengan urutan operasi seperti tertulis; bilangan bulat besar tidak boleh kehilangan presisi.

## 4. Non-goals

Pembatas terdistribusi, penyimpanan di luar memori, dan jam monotonic adalah tanggung jawab pemanggil.

## 5. Riwayat perubahan kontrak

- 0.1.0: kontrak awal.
