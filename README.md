# REDBOUND v2.1.3.2

**Bullet-heaven arcade** — Time Attack, Mission Mode & Co-op Duet.  
Single-file offline game (HTML). Play in the browser, no install.

## Play

- **Local:** open `index.html` in a modern browser (Chrome, Firefox, Edge, Safari).
- **GitHub Pages:** after enabling Pages on this repo →  
  `https://<username>.github.io/<repo-name>/`

## Modes

| Mode | Description |
|------|-------------|
| **Time Attack** | Survive escalating phases, chase high score |
| **Mission** | Clear sequential mission objectives |
| **Co-op Duet** | Local or **online** duo — revive your partner, share the fight |

## Controls

| Input | Action |
|-------|--------|
| **WASD** / Arrow keys | Move |
| **P** | Pause |
| **M** | Mute SFX |
| Touch / virtual stick | Move on mobile |
| **1 / 2 / 3** | Pick level-up upgrade |

## Features

- Pilots, weapons, passives, evolutions
- Permanent lab upgrades (Neon Cores)
- Skins, trails, themes, auras
- Daily missions & achievements
- Local + global-style leaderboards (device save)
- Online Co-op via public MQTT brokers (room code or quick match)
- Full offline save (export / import JSON)

## Online Co-op notes

- Uses public MQTT WebSocket brokers (EMQX / HiveMQ / Mosquitto test).
- **Host** creates a room code; **guest** joins with that code (or use quick match).
- Progress and cosmetics stay on each device; only the live match is synced.
- Some networks block public MQTT WebSockets — try another network if match fails.

## Save data

- Stored in browser `localStorage`.
- Use **Profil → Backup** to export/import JSON (transfer or backup).

## Deploy (GitHub Pages)

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment**
3. Source: **Deploy from a branch**
4. Branch: `main` · Folder: `/ (root)`
5. Open the Pages URL — `index.html` is served automatically.

No build step, Node, or bundler required.

## Tech

- Single `index.html` (HTML + CSS + JS)
- Canvas 2D renderer
- Web Audio API
- MQTT over WebSocket for online duet

## License

MIT — see [LICENSE](LICENSE).
