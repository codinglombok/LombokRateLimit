# Tech Debt LombokRateLimit

| ID | Prioritas | Temuan | Perbaikan |
|---|---|---|---|
| TD-01 | P0 | CI GitHub belum pernah dijalankan; action belum di-pin SHA | Pasang caller ke lombok-ci.yml |
| TD-02 | P0 | `lombok doctor docs/privacy/style` belum ada | Jalankan setelah tersedia (TD-P0-08 ekosistem) |
| TD-03 | P1 | Port Rust, Go, PHP belum ada; Rust adalah referensi no_std | Tambah port dan runner vector |
| TD-04 | P1 | Coverage dan fuzz belum diukur | Tambah job coverage dan fuzz |
| TD-05 | P1 | 7 dari 12 dokumen standar belum ditulis (changelog_, structure_repo_, full_summary_, guide_, how_to_dist_, development_ide_, Lang_) | Render dari templat pusat |
| TD-06 | P2 | Vector dibangkitkan dari referensi TypeScript; ekspektasi tidak independen | Tinjauan manual sampel vector |
| TD-07 | P2 | npm pack, twine check, tsc build belum dijalankan | Jalankan di CI |
