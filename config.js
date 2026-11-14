// Publishable key aman dipublikasikan (dilindungi RLS). JANGAN pernah memakai secret key di sini.
// Catatan: kunci JWT lama (eyJ...) sudah DITOLAK endpoint Auth Supabase — semua
// login email/Google gagal "Invalid API key" kalau masih pakai kunci lama.
window.REDBOUND_CONFIG = {
  SUPABASE_URL: "https://rpkispipazjiunjylaxu.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_K6IrLeztZ1IFpWtv2OGP5Q_xn7dt3hT"
};
// LOGIN GOOGLE: sudah AKTIF di Supabase (Client ID terpasang lewat API).
// Panduan lengkap tetap ada di file supabase/GOOGLE_SETUP.txt
