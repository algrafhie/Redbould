# REDBOUND v2.1.6.3 — Paket Deploy GitHub/Vercel

## Isi folder (5 file)
| File | Status |
|---|---|
| `index.html` | DIPERBARUI — satu-satunya HTML terbaru (v2.1.6.3) |
| `sw.js` | DIPERBARUI — cache name baru, semua pemain otomatis dapat versi baru |
| `manifest.json` | DIPERBARUI — versi 2.1.6.3 |
| `vercel.json` | SAMA seperti punyamu (tidak berubah) |
| `CARA-DEPLOY.md` | Panduan ini |

## Cara deploy (cukup 3 file)
1. Di repo GitHub: timpa `index.html`, `sw.js`, `manifest.json` dengan file dari folder ini.
2. Commit → Vercel deploy otomatis (±1 menit).
3. Di HP: buka game, tarik-refresh 1x. Selesai — semua pemain otomatis naik ke v2.1.6.3.

## Isi v2.1.6.3 (semua versi lama TIDAK lagi diperlukan)
1. **v2.1.6.1 tetap utuh**: lag online berkurang (2 broker, paket dipangkas),
   posisi guest tidak hilang lagi (watchdog 25 dtk + reconnect + banner "⟳ KONEKSI KEMBALI"),
   anti-rollback posisi, service worker tidak mengganti respons API dengan HTML.
2. **Leaderboard global otomatis**:
   - Skor tersimpan OTOMATIS di akhir ronde — tidak perlu tombol "Simpan Skor".
   - Tab "🌐 GLOBAL" jadi default: semua pemain saling melihat (top 100, server Supabase).
   - 1 nama = 1 baris, APA PUN perangkatnya (APK, HP ini, HP teman) — server memakai
     baris yang sama bila callsign sudah ada, skor terbaik yang disimpan.
   - Toast "🏆 Peringkat global #N" saat skor masuk peringkat.
3. **BARU di 2.1.6.3 — pembersihan otomatis**:
   - Papan SOLO/SQUAD lama di HP yang berisi entri dobel (bekas versi lama) dibersihkan
     otomatis saat game dibuka: 1 nama tetap 1 baris, skor terbaik yang dipertahankan.

## Hasil uji otomatis (Playwright + server langsung)
- 13 skenario game: boot, tab GLOBAL default, auto-simpan, 2x main tetap 1 nama,
  skor masuk papan global, 0 error console — SEMUA PASS.
- Uji server 2 perangkat beda + nama sama → tetap 1 baris, skor terbaik tersimpan — PASS.
- Uji bersih papan lama (4 entri dobel solo + 5 entri dobel squad → 2 + 2) — PASS.
