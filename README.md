# REDBOUND Android

Aplikasi Android sederhana yang menjalankan `index.html` lokal melalui WebView. Gameplay dimuat dari paket dan preferensi memakai DOM storage. Koneksi internet dibutuhkan untuk fitur cloud/Supabase dan pemuatan library Supabase eksternal.

## Build APK

Buka folder ini menggunakan Android Studio (JDK 17 dan Android SDK Platform 35), tunggu Gradle Sync, lalu pilih **Build > Build Bundle(s) / APK(s) > Build APK(s)**. APK debug akan ada di `app/build/outputs/apk/debug/app-debug.apk`.

Alternatif terminal, dari folder ini: `gradle assembleDebug` (dengan Android SDK Platform 35 dan Build Tools terpasang).
