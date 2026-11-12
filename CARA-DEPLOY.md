# REDBOUND v2.1.6.1 — Paket Deploy GitHub/Vercel

## Isi folder (4 file, sama seperti repo kamu)
| File | Status |
|---|---|
| `index.html` | DIPERBARUI (inti perbaikan) |
| `sw.js` | DIPERBARUI (cache name baru + perbaikan fallback) |
| `manifest.json` | DIPERBARUI (versi 2.1.6.1) |
| `vercel.json` | TIDAK DIUBAH (sama seperti punyamu) |

## Cara deploy
1. Upload/ganti `index.html`, `sw.js`, `manifest.json` di repo GitHub (nama file sama, timpa saja).
2. Commit → tunggu Vercel deploy otomatis (±1 menit).
3. Di HP: buka game, tarik-refresh 1x. Service worker memakai cache name baru, jadi
   semua pemain otomatis dapat versi baru tanpa hapus data.

## Yang diperbaiki (hanya bagian online — mode lain tidak disentuh)
1. **Lag online berkurang drastis**
   - Paket pertempuran (msnap/snap/input) dulu dikirim ke **3 broker sekaligus**;
     sekarang cukup ke **2 broker terbaik** (bandwidth hemat ±3x, anti rate-limit broker publik).
   - Snapshot penuh dipangkas: musuh 44→26, peluru 48→28, peluru musuh 32→18,
     misil 20→12, gem 40→24, pickup 16→10, efek (nova/beam/petir/lubang/ring) dipangkas.
   - Laju kirim diturunkan halus: msnap 15,4→12,1 paket/dtk, snapshot penuh 5→3/dtk,
     input guest 18→13/dtk (mata tidak merasakan bedanya, jaringan jauh lebih ringan).
2. **Posisi guest hilang di tengah misi → diperbaiki**
   - Penyebab: watchdog "LINK LOST" 10 detik terlalu galak (jaringan bergetar sebentar
     langsung memutus; mitra berubah jadi AI dan posisinya hilang) dan **tidak pernah
     bisa tersambung lagi** selama misi.
   - Sekarang: batas 25 detik + reconnect otomatis + **auto-resync**: begitu sinyal mitra
     hidup lagi, posisi musuh/mitra disinkron ulang dan muncul banner
     "⟳ KONEKSI KEMBALI — mitra terhubung ulang!" — misi berlanjut tanpa ganti AI.
3. **Anti-rollback**: paket lama dari broker yang lambat tidak bisa lagi menimpa
   posisi yang lebih baru (sebelumnya hanya msnap yang dijaga; snap bisa mundur →
   posisi tersendat-sendat).
4. **Service worker**: permintaan ke server/broker tidak lagi diganti file HTML saat
   jaringan gagal (dulu bisa membuat data sesi gagal terbaca).

## Hasil uji otomatis (2 tab, co-op nyata)
- Pairing host+guest: OK • posisi host→guest & guest→host tersinkron
- Posisi guest TIDAK tertimpa stream host • 0 error console
- Diputus paksa → auto resync tanpa keluar misi: OK
