# Paket Deploy GitHub & Vercel — REDBOUND v2.1.6.8

## Daftar File yang Diupload ke Repo GitHub (`redbound.vercel.app`)
1. `index.html` — File utama REDBOUND v2.1.6.8 (sudah diperbaiki jembatan variabel IIFE ke Supabase, sinkronisasi otomatis Koin/Trofi/Kapal/Upgrade, Papan Peringkat Global Otomatis Top 100, serta tombol Download/Instal APK di dalam menu Pengaturan Cepat `⚙️`).
2. `sw.js` — Service Worker `v2.1.6.8` (otomatis memperbarui cache di semua perangkat dan membiarkan request API Supabase lewat langsung tanpa diganti HTML).
3. `manifest.json` — Konfigurasi WebAPK `v2.1.6.8` dengan logo resmi REDBOUND.
4. `icon-192.png` & `icon-512.png` — Ikon resmi APK REDBOUND untuk layar utama HP.
5. `vercel.json` & `.nojekyll` — Pengaturan header anti-cache basi untuk Vercel/GitHub.

## Langkah Upload ke GitHub
1. Buka repository GitHub yang terhubung ke `https://redbound.vercel.app/`.
2. Klik **Add file → Upload files**, tarik semua file di dalam paket ini (`index.html`, `sw.js`, `manifest.json`, `icon-192.png`, `icon-512.png`, `vercel.json`, `.nojekyll`), lalu klik **Commit changes**.
3. Tunggu ±1 menit hingga Vercel selesai deploy, lalu muat ulang (`refresh`) halaman di HP.
