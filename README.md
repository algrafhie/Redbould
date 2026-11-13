# 🚀 RED BOUND — 3D Orbital Arena Space Shooter (`v2.1.6.8`)

**RED BOUND** adalah game web *space shooter* interaktif dengan antarmuka **3D Orbital Launch Pad** dan **3D Starfighter** real-time berbasis HTML5 Canvas, Web Audio API, serta dukungan PWA (*Progressive Web App*) dan *cloud backend* [Supabase Edge Function](https://rpkispipazjiunjylaxu.supabase.co/functions/v1/app).

🔗 **Live Production**: [Redbound di Vercel (`https://redbound.vercel.app/`)](https://redbound.vercel.app/)  
🗄️ **Backend & Cloud Sync**: [Supabase Dashboard (`rpkispipazjiunjylaxu`)](https://supabase.com/dashboard/project/rpkispipazjiunjylaxu)

---

## ✨ Pembaruan Terbaru (`v2.1.6.8`)

1. **Beranda 3D Orbital Launch Pad Presisi**:
   - **Header & Kontrol Latar Terpadu**: Menampilkan lencana profil, skor tertinggi, *Core Currency*, tombol pemilih tema latar arena (*Gelap Polos*, *Nebula*, *Magma*, *Cyber*, *Void*, *Solar*), *slider* pengatur tingkat kecerahan latar (`25%` – `140%`), serta pengatur tingkat bahaya (*Aman x1* hingga *Mematikan x3*).
   - **Lantai Lingkaran Launchpad & Area Bawah Gelap**: Pesawat berdiri di atas landasan lingkaran mekanis 3D dengan cincin energi berputar yang berubah warna mengikuti pilot aktif, sementara area bawah lingkaran landasan tetap gelap pekat agar informasi teks tampil kontras dan nyaman di mata.
   - **Tata Letak Nama & Subjudul Pesawat Terbaru**: Blok nama pesawat (`#launchpadPilotTitle`, ukuran diperbesar `clamp(32px, 8.5vw, 40px)`) beserta subjudul spesifikasi senjata (`#launchpadPilotSub`) ditempatkan secara presisi di area gelap bawah lingkaran landasan (`bottom: 44px`), tepat di atas deskripsi mode misi.
   - **HUD Melengkung Kiri & Kanan**: Menampilkan indikator *HP*, *SPD*, *DMG*, *SHD*, dan senjata utama dengan tombol panah `<` `>` untuk mengganti pilot secara instan serta tombol *Duet Partner* interaktif.
2. **Pesawat Tempur 3D di Dalam Arena Pertempuran**:
   - Fungsi `drawFighter` dan `drawRedboundFighter` kini merender tekstur pesawat 3D beresolusi tinggi dengan penyesuaian warna otomatis (*hue-shifted 3D sprite cache*) untuk seluruh 8 pilot (**DART**, **VOLT**, **TITAN**, **SPECTRE**, **NOVA**, **AERO**, **VORTEX**, **NYX**) maupun *custom skin* Hanggar, lengkap dengan efek *twin plasma afterburner* dan kepulan asap pendorong.
3. **Alur Sistem & Fitur Utuh 100%**:
   - Seluruh mode permainan (**Time Attack**, **Mission 10 Bos**, **Co-op Duet**, dan **Online Multiplayer**), **Hanggar** (8 pilot + kustomisasi warna/skin), **Upgrade** stat permanen, **Profil** & sinkronisasi akun, hingga efek suara dan penyimpanan lokal (`localStorage`) tetap berjalan penuh tanpa perubahan logika sistem.

---

## 📦 Struktur File Paket Deploy

Paket `redbound-github-deploy.zip` berisi seluruh file siap unggah ke repositori GitHub maupun [Vercel](https://redbound.vercel.app/):

| Nama File | Fungsi Utama |
| :--- | :--- |
| `index.html` | Aplikasi utama **RED BOUND** (`v2.1.6.8`) lengkap dengan aset 3D terintegrasi (*self-contained*), logika game, audio, dan UI. |
| `manifest.json` | Konfigurasi *Web App Manifest* untuk instalasi PWA di perangkat Android, iOS, dan desktop (orientasi *portrait*, *standalone*). |
| `sw.js` | *Service Worker* (`redbound-v2.1.6.8`) untuk *caching* aset utama dan pembaruan otomatis (*network-first* untuk `index.html`). |
| `icon-192.png` | Ikon aplikasi PWA ukuran `192x192` piksel. |
| `icon-512.png` | Ikon aplikasi PWA ukuran `512x512` piksel. |
| `vercel.json` | Konfigurasi *headers* dan *cache-control* untuk deployment di [Vercel](https://redbound.vercel.app/) agar pembaruan `index.html` dan `sw.js` langsung aktif tanpa nyangkut di *cache* browser. |
| `.nojekyll` | Penanda khusus agar GitHub Pages melayani seluruh file statis secara langsung tanpa pemrosesan Jekyll. |
| `CARA-DEPLOY-GITHUB.md` | Panduan langkah demi langkah unggah ke GitHub dan sinkronisasi otomatis ke Vercel. |
| `README.md` | Dokumentasi utama proyek, daftar fitur, arsitektur, dan panduan instalasi/deployment. |

---

## 🚀 Cara Deploy ke GitHub & Vercel

### Opsi A — Melalui Web GitHub (Tanpa Terminal)
1. Ekstrak file `redbound-github-deploy.zip` di komputer atau ponsel Anda.
2. Buka repositori GitHub proyek **RED BOUND** Anda, klik **Add file** → **Upload files**.
3. Pilih seluruh file hasil ekstrak (`index.html`, `sw.js`, `manifest.json`, `icon-192.png`, `icon-512.png`, `vercel.json`, `.nojekyll`, `README.md`, dan `CARA-DEPLOY-GITHUB.md`).
4. Tulis pesan *commit* (contoh: `Update v2.1.6.8: posisi & ukuran nama pesawat di beranda 3D`), lalu klik **Commit changes**.
5. Jika repositori sudah terhubung ke [Redbound di Vercel](https://redbound.vercel.app/), Vercel akan otomatis memproses *build* dan memperbarui situs dalam **15–30 detik**.

### Opsi B — Melalui Git CLI (Terminal)
```bash
# 1. Ekstrak paket deploy ke folder repositori lokal Anda
unzip -o redbound-github-deploy.zip -d ./

# 2. Tambahkan seluruh perubahan, commit, dan push ke branch utama
git add index.html sw.js manifest.json icon-192.png icon-512.png vercel.json .nojekyll README.md CARA-DEPLOY-GITHUB.md
git commit -m "Release v2.1.6.8: update 3D launchpad pilot title position and size"
git push origin main
```

---

## 🔄 Tips Jika Tampilan Lama Masih Muncul (Cache PWA)

Karena aplikasi menggunakan *Service Worker* untuk dukungan PWA, jika browser masih menampilkan versi sebelumnya setelah deploy:
1. Di komputer: tekan **Ctrl + Shift + R** (Windows/Linux) atau **Cmd + Shift + R** (Mac) untuk *Hard Reload*.
2. Di ponsel Android/iOS: tutup tab browser, hapus *cache* situs untuk `redbound.vercel.app`, lalu buka kembali [https://redbound.vercel.app/](https://redbound.vercel.app/).
