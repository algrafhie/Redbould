/* REDBOUND Cloud v3 — Supabase Auth + Postgres (RLS) + Realtime.
   Menggantikan modul "Cloud Vault" lama (Edge Function 'app') dan transport MQTT publik.
   Tanpa konfigurasi / tanpa internet: game tetap jalan penuh sebagai mode lokal. */
(function () {
  "use strict";
  var net = window.RedboundNet, C = window.REDBOUND_CONFIG || {};
  if (!net) return;
  var B = function () { return window.__rbBridge || null; };
  var K = { rev: "neon-survivor:cloudRev", ts: "neon-survivor:cloudTs", board: "neon-survivor:global:board", dirty: "redbound:cloudDirty" };
  var sb = null, user = null, syncErr = false, pushTimer = null, lastTop = 0, topP = null;
  try {
    if (window.supabase && C.SUPABASE_URL && C.SUPABASE_ANON_KEY && String(C.SUPABASE_ANON_KEY).indexOf("ISI_") !== 0) {
      sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, storageKey: "redbound-auth" },
        realtime: { params: { eventsPerSecond: 30 } }
      });
    }
  } catch (e) { sb = null; }
  window.REDBOUND_CLOUD_READY = !!sb;

  /* ---------- util ---------- */
  function sGet(k) { try { var b = B(); return b && b.SafeStorage ? b.SafeStorage.getItem(k) : localStorage.getItem(k); } catch (e) { return null; } }
  function sSet(k, v) { try { var b = B(); if (v === null) { if (b && b.SafeStorage) b.SafeStorage.removeItem(k); else localStorage.removeItem(k); } else if (b && b.SafeStorage) b.SafeStorage.setItem(k, v); else localStorage.setItem(k, v); } catch (e) {} }
  function jp(s) { try { return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function T(p, ms) {
    return new Promise(function (res, rej) {
      var t = setTimeout(function () { rej(new Error("timeout")); }, ms || 9000);
      Promise.resolve(p).then(function (v) { clearTimeout(t); res(v); }, function (e) { clearTimeout(t); rej(e); });
    });
  }
  function isNet(e) { return !!e && (e.status === 0 || e.name === "AuthRetryableFetchError" || /fetch|network|timeout|load failed/i.test(String(e.message || e))); }
  function online() { return navigator.onLine !== false; }
  function toast(en, id) { try { var b = B(); if (b && b.toast) b.toast(en, id); } catch (e) {} }
  function accounts() { try { var b = B(); return (b && b.loadAccounts && b.loadAccounts()) || {}; } catch (e) { return {}; } }
  function authed() { return !!(sb && user); }

  /* ---------- state game ---------- */
  function meta() { try { var m = B() && B().getMeta && B().getMeta(); if (m) return m; } catch (e) {} return jp(sGet("neon-survivor:meta")) || {}; }
  function progress() { try { var p = B() && B().getProgress && B().getProgress(); if (p) return p; } catch (e) {} return jp(sGet("neon-survivor:progress")) || { counters: {}, ach: [] }; }
  function best() {
    var b = 0;
    try { if (B() && B().getBest) b = Number(B().getBest()) || 0; } catch (e) {}
    b = Math.max(b, Number(sGet("neon-survivor:best")) || 0);
    var p = progress(); if (p && p.counters) b = Math.max(b, Number(p.counters.bestScore) || 0);
    return b;
  }
  function danger() { try { if (B() && B().getDanger) return Number(B().getDanger()) || 0; } catch (e) {} return Number(sGet("neon-survivor:danger")) || 0; }
  function sess() { try { return (B() && B().getSession && B().getSession()) || jp(sGet("neon-survivor:session")) || null; } catch (e) { return null; } }
  function callsign() {
    var s = sess(), cs = "";
    if (s && s.callsign && s.callsign !== "OFFLINE-PILOT") cs = s.callsign;
    if (!cs && B() && B().getCallsign) cs = B().getCallsign();
    if (!cs) cs = sGet("neon-survivor:name") || "";
    return String(cs || "PILOT").trim().slice(0, 16) || "PILOT";
  }
  function snap(bump) {
    var rev = Number(sGet(K.rev) || 0), now = Date.now();
    if (bump) { rev++; sSet(K.rev, String(rev)); sSet(K.ts, String(now)); }
    var s = sess() || {};
    return { type: "cloud_vault_save", schemaVersion: "3.0", rev: rev, updatedAt: now, callsign: callsign(),
      email: user ? user.email : (s.email || ""), meta: meta(), progress: progress(), best: best(), danger: danger() };
  }

  /* ---------- status (internal saja, tanpa badge persisten di UI) ---------- */
  /* Aturan notif (permintaan user):
     - Saat mulai main & online: toast SEKALI "Online — Cloud aktif", lalu hilang.
     - Saat koneksi turun: toast SEKALI "Offline — progres disimpan", lalu hilang.
     - TIDAK ADA elemen/badge yang muncul terus-menerus di layar. */
  var lastStatus = "init";
  function statusKey() {
    if (!sb) return "no-cloud";
    if (!online()) return "offline";
    if (!user) return "guest";
    if (syncErr) return "sync-err";
    return "online";
  }
  function chip() {
    var s = statusKey();
    if (s === lastStatus) return;
    var prev = lastStatus;
    lastStatus = s;
    if (prev === "init") {
      // Boot pertama: beri notif sekali saja kalau online (jangan saat offline — event listener offline yang urus)
      if (s === "online" || s === "guest") toast("🌐 Online — Cloud aktif", "🌐 Online — Cloud aktif");
      return;
    }
    if (s === "offline") toast("📴 Offline — progres disimpan di perangkat", "📴 Offline — progres disimpan di perangkat");
    else if (s === "sync-err") toast("⚠ Cloud sync gagal — coba lagi otomatis", "⚠ Sinkron cloud gagal — coba lagi otomatis");
  }
  // Tidak ada elemen DOM persisten yang dibuat.

  if (sb) {
    sb.auth.getSession().then(function (r) { user = r.data && r.data.session ? r.data.session.user : null; chip(); }).catch(function () {});
    sb.auth.onAuthStateChange(function (ev, s) {
      user = s && s.user ? s.user : null;
      chip();
      // Login via Google OAuth (redirect balik dari Google): beri tahu UI agar masuk otomatis.
      if (ev === "SIGNED_IN" && user && typeof window.__rbOnCloudSignedIn === "function") {
        try { window.__rbOnCloudSignedIn(user); } catch (e) {}
      }
    });
  }

  /* ---------- akun (Supabase Auth) ---------- */
  net.subscribeSessionVault = function () {};
  net.publishRetained = function () {};

  // Helper: bersihkan progress lokal saat ganti akun.
  // Wajib dipanggil sebelum login akun baru supaya data akun lama tidak bocor.
  function clearLocalProgressForAccountSwitch() {
    try {
      // Hapus progress game, meta, best score — supaya akun baru tidak mewarisi data akun lama
      sSet("neon-survivor:progress", null);
      sSet("neon-survivor:meta", null);
      sSet("neon-survivor:best", null);
      sSet("neon-survivor:danger", null);
      sSet("neon-survivor:name", null);
      sSet("neon-survivor:cloudRev", "0");
      sSet("neon-survivor:cloudTs", "0");
      sSet("redbound:cloudDirty", "0");
      sSet("neon-survivor:global:board", null);
      sSet("neon-survivor:cloudSyncPayload", null);
      // Reset state game di memori via bridge (jika tersedia)
      var b = B();
      if (b && b.applyCloudSnapshot) {
        // Paksa reset state ke fresh: hanya volt, 0 cores, 0 trophies
        try { b.applyCloudSnapshot({ type: "cloud_vault_save", schemaVersion: "3.0", rev: 1, updatedAt: Date.now(),
          callsign: "PILOT", meta: { sel: "volt", chars: ["volt"], cores: 0, trophies: 0, missionCleared: ["volt"],
            levels: {}, skins: [], trails: [], effects: [], themes: [], trail: "none", skin: "default", theme: "classic",
            effect: "none", partner: "", lastSupply: "" },
          progress: { ach: [], counters: { runs:0, kills:0, bestScore:0, bestKills60:0, bestBosses:0, bestLevel:0, bestPhase:0,
            chests:0, evolutions:0, winsTimed:0, winsMission:0, winsDuet:0, duetFlawless:false, bestDangerWin:0 },
            daily: { day: "", goals: [], streak: 0, lastAllDone: "" }, shields: 0 },
          best: 0, danger: 0 }, false);
        } catch (e) {}
      }
    } catch (e) {}
  }

  net.createCloudAccount = async function (idVal, pwdVal, csVal, ms) {
    if (!sb || !online()) return { ok: false, unreachable: true, error: "offline" };
    var em = String(idVal || "").trim().toLowerCase();
    var cs = String(csVal || callsign()).trim().toUpperCase().slice(0, 16);
    // FIX: bersihkan progress lokal supaya akun baru fresh (tidak mewarisi data akun lama di HP yg sama)
    clearLocalProgressForAccountSwitch();
    var r;
    try { r = await T(sb.auth.signUp({ email: em, password: String(pwdVal), options: { data: { callsign: cs } } }), ms); }
    catch (e) { return { ok: false, unreachable: true, error: "tidak terhubung" }; }
    if (r.error) {
      var m = String(r.error.message || "");
      if (isNet(r.error)) return { ok: false, unreachable: true, error: m };
      if (r.error.status === 422 || /already|registered/i.test(m)) return { ok: false, status: 409, error: "email sudah terdaftar" };
      return { ok: false, error: m };
    }
    var u = r.data && r.data.user;
    if (u && u.identities && u.identities.length === 0) return { ok: false, status: 409, error: "email sudah terdaftar" };
    if (!r.data.session) return { ok: false, error: "cek email untuk konfirmasi, lalu MASUK (atau matikan 'Confirm email' di Supabase)" };
    user = r.data.session.user;
    await doPush();
    return { ok: true, created: true };
  };

  net.pullCloudAccount = async function (idVal, pwdVal, ms) {
    if (!sb || !online()) return { found: false, unreachable: true };
    var id = String(idVal || "").trim().toLowerCase(), rec0 = accounts()[id];
    if (rec0 && rec0.email) id = String(rec0.email).trim().toLowerCase();
    // FIX: bersihkan progress lokal supaya saat applyCloudSnapshot dipanggil, data murni dari cloud
    // (tidak merge dengan progress akun lama yang ada di localStorage HP ini)
    clearLocalProgressForAccountSwitch();
    var r;
    try { r = await T(sb.auth.signInWithPassword({ email: id, password: String(pwdVal) }), ms); }
    catch (e) { return { found: false, unreachable: true }; }
    if (r.error) {
      if (isNet(r.error)) return { found: false, unreachable: true };
      var m = String(r.error.message || "") + " " + String(r.error.code || "");
      if (/invalid.*(login|credentials)/i.test(m)) {
        // akun lama yang dibuat saat offline: daftarkan otomatis bila kode lokal cocok
        if (rec0 && rec0.code === pwdVal && /@/.test(id)) {
          var c = await net.createCloudAccount(id, pwdVal, rec0.callsign, ms);
          if (c.ok) return net.pullCloudAccount(id, pwdVal, ms);
        }
        return { found: true, authError: true };
      }
      return { found: true, authError: true };
    }
    user = r.data.user; syncErr = false; chip();
    try {
      var p = await T(sb.from("profiles").select("callsign,vault").eq("id", user.id).single(), ms);
      var v = p.data && p.data.vault && p.data.vault.meta ? p.data.vault : null;
      var cs = (p.data && p.data.callsign) || callsign();
      return { found: true, authError: false, data: Object.assign(v ? {} : snap(false), v || {}, { callsign: cs, email: user.email }) };
    } catch (e) { return { found: true, authError: false, data: Object.assign(snap(false), { email: user.email }) }; }
  };

  /* ---------- Login Google (OAuth asli — Account Picker HP) ---------- */
  /* Alur yang benar (permintaan user): klik tombol Google G → PEMILIH AKUN GOOGLE
     bawaan HP/Chrome muncul otomatis → pilih email → halaman password/verifikasi
     milik Google → kembali ke game, langsung login. Tidak ada input email manual.
     Syarat 1x setup: aktifkan provider Google di Supabase Dashboard
     (panduan: supabase/GOOGLE_SETUP.txt). */
  net.signInWithGoogle = async function () {
    if (!sb) return { ok: false, error: "cloud" };
    if (!online()) return { ok: false, error: "offline" };
    try {
      // Cek dulu: apakah provider Google sudah aktif di project Supabase?
      var sres = await T(fetch(C.SUPABASE_URL + "/auth/v1/settings", { headers: { apikey: C.SUPABASE_ANON_KEY } }), 6000);
      var st = await sres.json();
      if (!st || !st.external || !st.external.google) return { ok: false, error: "google-not-enabled" };
      // Buang sesi lokal lama supaya pemilih akun Google selalu muncul (bukan auto-login akun lama)
      try { await sb.auth.signOut(); } catch (e) {}
      await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + location.pathname } });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String(e && e.message || e) };
    }
  };

  /* ---------- vault (progres akun) ---------- */
  var lastCs = null;
  async function doPush() {
    pushTimer = null;
    if (!authed()) return { ok: false, noAuth: true };
    if (!online()) { sSet(K.dirty, "1"); chip(); return { ok: false, offline: true }; }
    var s = snap(true);
    try {
      var r = await T(sb.from("profiles").update({ vault: s, updated_at: new Date().toISOString() }).eq("id", user.id), 9000);
      if (r.error) throw r.error;
      sSet(K.dirty, "0"); syncErr = false; chip();
      if (s.callsign && s.callsign !== lastCs) { lastCs = s.callsign; sb.from("profiles").update({ callsign: s.callsign }).eq("id", user.id).then(function () {}, function () {}); }
      return { ok: true };
    } catch (e) { sSet(K.dirty, "1"); syncErr = true; chip(); return { ok: false, error: String(e && e.message || e) }; }
  }
  net.pushCloudVault = function (immediate) {
    if (net._suppressCloudPush) return Promise.resolve({ ok: false, suppressed: true });
    if (!authed()) return Promise.resolve({ ok: false, noAuth: true });
    if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; }
    if (immediate) return doPush();
    pushTimer = setTimeout(doPush, 1500);
    return Promise.resolve({ ok: true, queued: true });
  };
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden" && pushTimer) { clearTimeout(pushTimer); doPush(); } });

  /* ---------- papan peringkat global ---------- */
  function norm(rows) {
    var map = new Map();
    (Array.isArray(rows) ? rows : []).forEach(function (r) {
      if (!r) return;
      var nm = String(r.name || r.callsign || "PILOT").trim().slice(0, 24), sc = Number(r.score) || 0;
      if (!nm || sc <= 0) return;
      var k = nm.toUpperCase(), p = map.get(k);
      if (!p || sc > p.score) map.set(k, { name: nm, score: sc, kills: +r.kills || 0, survived: +r.survived || 0, level: +r.level || 1, bosses: +r.bosses || 0, danger: +r.danger || 0 });
    });
    return Array.from(map.values()).sort(function (a, b) { return b.score - a.score; }).slice(0, 100);
  }
  function bestCand() {
    var sc = best(); if (sc <= 0) return null;
    var rows = []; try { rows = (B() && B().getSoloBoard) ? B().getSoloBoard() : []; } catch (e) {}
    var br = null; rows.forEach(function (r) { if (r && (!br || (+r.score || 0) > (+br.score || 0))) br = r; });
    sc = Math.max(sc, br ? +br.score || 0 : 0);
    var same = br && Math.abs((+br.score || 0) - sc) < 1, cs = callsign(), c = (progress().counters) || {};
    return { name: cs, callsign: cs, mode: "solo", score: sc,
      kills: same ? +br.kills || 0 : +c.bestRunKills || +c.kills || 0, survived: same ? +br.survived || 0 : +c.bestSurvived || 180,
      level: same ? +br.level || 1 : +c.maxLevel || 1, bosses: same ? +br.bosses || 0 : +c.bosses || 0, danger: same ? +br.danger || 0 : danger() };
  }
  net.getGlobalBoardRows = function () { // cache SERVER + rekor lokal hanya untuk tampilan (tidak disimpan)
    var rows = jp(sGet(K.board)) || [], c = bestCand();
    if (c) rows = rows.concat([c]);
    return norm(rows);
  };
  net.fetchGlobalScores = function (force) {
    var now = Date.now();
    if (!force && topP) return topP;
    if (!force && now - lastTop < 8000) return Promise.resolve(net.getGlobalBoardRows());
    if (!sb || !online()) return Promise.resolve(net.getGlobalBoardRows());
    lastTop = now;
    topP = T(sb.rpc("top_scores", { lim: 100 }), 8000).then(function (r) {
      topP = null;
      if (r.error || !Array.isArray(r.data)) return net.getGlobalBoardRows();
      sSet(K.board, JSON.stringify(norm(r.data)));
      if (B() && B().renderUI) B().renderUI();
      return net.getGlobalBoardRows();
    }).catch(function () { topP = null; return net.getGlobalBoardRows(); });
    return topP;
  };
  net.submitGlobalScore = function (entry, showRank) {
    if (!entry || !(Number(entry.score) > 0)) return Promise.resolve({ ok: false });
    if (!authed() || !online()) return Promise.resolve({ ok: false, queued: true }); // dikirim ulang saat boot/online
    return T(sb.rpc("submit_score", { p_score: Math.floor(+entry.score || 0), p_kills: Math.floor(+entry.kills || 0), p_survived: Math.floor(+entry.survived || 0),
      p_level: Math.max(1, Math.floor(+entry.level || 1)), p_bosses: Math.floor(+entry.bosses || 0), p_danger: Math.floor(+entry.danger || 0), p_mode: entry.mode || "solo" }), 9000)
      .then(function (r) {
        if (r.error) return { ok: false, error: r.error.message };
        var rank = r.data && r.data.rank;
        if (showRank && rank > 0 && rank <= 100) toast("🏆 Global Rank #" + rank + "!", "🏆 Peringkat global #" + rank + "!");
        net.fetchGlobalScores(true);
        return { ok: true, rank: rank };
      }).catch(function () { return { ok: false, error: "timeout" }; });
  };

  /* ---------- sinkron penuh ---------- */
  net.syncAllCloudNow = async function () {
    if (!sb || !online()) return { ok: false, error: "offline" };
    if (!user) { await net.fetchGlobalScores(true); return { ok: true, guestOnly: true }; }
    try {
      var r = await T(sb.from("profiles").select("vault").eq("id", user.id).single(), 8000);
      if (r.data && r.data.vault && r.data.vault.meta && B() && B().applyCloudSnapshot) B().applyCloudSnapshot(r.data.vault, false);
    } catch (e) {}
    var res = await doPush();
    var c = bestCand(); if (c) net.submitGlobalScore(c, false); else net.fetchGlobalScores(true);
    if (B() && B().renderUI) B().renderUI();
    return res;
  };
  net.bootCloudSync = async function () {
    try {
      if (B() && B().dedupBoards) B().dedupBoards();
      if (!sb || !online()) { chip(); if (!online() && sb) toast("📴 Offline — progres disimpan di perangkat", "📴 Offline — progres disimpan di perangkat"); return; }
      await sb.auth.getSession().then(function (r) { user = r.data && r.data.session ? r.data.session.user : null; }).catch(function () {});
      chip();
      var s = sess();
      if (!user && s && s.email && !s.isGuest) toast("☁ Cloud session ended — LOGIN again to sync.", "☁ Sesi cloud berakhir — MASUK lagi untuk sinkron.");
      if (user) await net.syncAllCloudNow(false); else net.fetchGlobalScores(true);
    } catch (e) {}
  };
  window.addEventListener("online", function () { toast("🌐 Back online — syncing...", "🌐 Kembali online — menyinkronkan..."); net.bootCloudSync(); });
  window.addEventListener("offline", function () { chip(); });

  /* ---------- multiplayer: Supabase Realtime (ganti broker MQTT publik) ---------- */
  if (sb) {
    var chans = {};
    var join = function (room) {
      if (chans[room]) return chans[room];
      if (room !== "LOBBY") Object.keys(chans).forEach(function (k) { if (k !== "LOBBY") { try { sb.removeChannel(chans[k].ch); } catch (e) {} delete chans[k]; } });
      var ch = sb.channel("rb:" + room, { config: { broadcast: { self: false, ack: false } } }), c = { ch: ch, ok: false, q: [] };
      ch.on("broadcast", { event: "m" }, function (m) {
        var p = (m && m.payload) || {};
        try { net.handleInbound(JSON.parse(p.payload), p.topic); } catch (e) {}
      });
      ch.subscribe(function (st) {
        if (st === "SUBSCRIBED") { c.ok = true; c.q.splice(0).forEach(function (x) { ch.send(x); }); }
        else if (st === "CHANNEL_ERROR" || st === "TIMED_OUT" || st === "CLOSED") c.ok = false;
      });
      return (chans[room] = c);
    };
    var send = function (room, topic, json) {
      var c = join(room), m = { type: "broadcast", event: "m", payload: { topic: topic, payload: json } };
      if (c.ok) c.ch.send(m); else { c.q.push(m); if (c.q.length > 20) c.q.shift(); }
    };
    var fake = { readyState: 1, _mqttReady: true, _subs: new Set(), send: function () {} };
    net.connect = function () { return Promise.resolve(); };
    net.getOpenSockets = function () { return online() ? [fake] : []; };
    net.sendSubToSocket = function () {};
    net.sendSubToSockets = function (t) {
      var m = /^rb\/v2\/([^\/]+)\/#$/.exec(String(t || ""));
      if (m && m[1] !== "vault") join(m[1]);
    };
    net.publish = function (sub, obj, overrideRoom) {
      var room = overrideRoom || net.roomCode; if (!room) return;
      var topic = "rb/v2/" + room + "/" + sub, seq = net.msgSeq++;
      var json = JSON.stringify(Object.assign({}, obj, { _room: room, _sender: net.clientId, _pid: net.clientId + "_" + seq, _seq: seq }));
      send(room, topic, json);
      if (net.bc) { try { net.bc.postMessage({ topic: topic, payload: json }); } catch (e) {} }
    };
  }

  window.REDBOUND_CLOUD = { version: "3.0", ready: !!sb, push: function () { return net.pushCloudVault(true); },
    pull: function (i, p) { return net.pullCloudAccount(i, p); }, syncNow: function () { return net.syncAllCloudNow(true); },
    fetchScores: function () { return net.fetchGlobalScores(true); },
    signOut: async function () {
      if (!sb) return Promise.resolve();
      try { await sb.auth.signOut(); } catch (e) {}
      // FIX: clear local session + progress setelah signOut, supaya UI kembali ke TAMU
      // dan progress akun lama tidak bocor ke akun baru yang login berikutnya
      try {
        sSet("neon-survivor:session", null);
        sSet("neon-survivor:progress", null);
        sSet("neon-survivor:meta", null);
        sSet("neon-survivor:best", null);
        sSet("neon-survivor:danger", null);
        sSet("neon-survivor:cloudRev", "0");
        sSet("neon-survivor:cloudTs", "0");
        sSet("redbound:cloudDirty", "0");
        user = null;
        chip();
      } catch (e) {}
    } };
})();
