#!/usr/bin/env python3
"""Pakai: python3 patch_redbound.py REDBOUND_v2_1_6_8.html  ->  index.html"""
import re, sys
src = open(sys.argv[1], encoding="utf-8").read()
def once(s, old, new, label):
    assert s.count(old) == 1, f"GAGAL ({label}): ditemukan {s.count(old)}x, harusnya 1x"
    return s.replace(old, new)

# 1) ganti seluruh <script> modul Cloud Vault lama (Edge Function 'app') dengan modul baru
m = src.index("REDBOUND CLOUD VAULT & GLOBAL LEADERBOARD")
a = src.rfind("<script>", 0, m); b = src.index("</script>", m) + len("</script>")
new_tags = ('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js" crossorigin="anonymous"></script>\n'
            '<script src="config.js"></script>\n<script src="redbound-cloud.js"></script>')
src = src[:a] + new_tags + src[b:]

# 2) hapus akun bawaan hardcoded (volt@redbound.io / neon2026)
src, n = re.subn(r'return \{\s*"volt@redbound\.io": \{[^}]*\}\s*\};', 'return {};', src)
assert n == 1, "GAGAL (akun bawaan)"

# 3) pesan login yang jujur (Supabase tidak membedakan 'email belum terdaftar' vs 'kode salah')
src = once(src, "⚠ Incorrect Access Code for this Cloud Account.",
           "⚠ Wrong email or Access Code (or not registered yet — tap REGISTER NEW PILOT).", "pesan EN")
src = once(src, "⚠ Kode Akses salah untuk Akun Cloud ini.",
           "⚠ Email atau Kode Akses salah (atau belum terdaftar — klik DAFTAR PILOT BARU).", "pesan ID")
open("index.html", "w", encoding="utf-8").write(src)
print("OK -> index.html", len(src), "byte")
