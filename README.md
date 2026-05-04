# Constellation Weaver

A quiet nightly ritual. Trace a constellation by connecting its stars in order.

```
web-app/
├── index.html               game shell
├── css/styles.css           design system
├── js/
│   ├── app.js               screens, navigation, save state
│   ├── game.js              renderer, touch, snap-to-dot mechanic
│   └── levels.js            20 embedded levels
├── icons/icon.svg           PWA icon
├── manifest.webmanifest     PWA manifest
├── sw.js                    service worker (offline cache)
└── docs/                    GDD, design brief, original level JSON, prototypes
```

No build step. Plain HTML / CSS / ES modules.

## Run locally

Any static file server works. Two options:

```powershell
# Node
npx http-server -p 8080 -c-1

# Python
python -m http.server 8080
```

Then open <http://localhost:8080>.

The service worker only registers over HTTPS or `localhost`, so play through `localhost` (not `127.0.0.1` if you want add-to-home-screen to work cleanly later).

## Play on your phone — three ways

### 1. Same Wi-Fi as your PC (fastest)

Find your PC's LAN IP and start the server:

```powershell
# In the web-app folder
ipconfig | Select-String IPv4   # e.g. 192.168.1.42
npx http-server -p 8080 -c-1 --host 0.0.0.0
```

On your phone (same Wi-Fi), open `http://192.168.1.42:8080`.

If Windows blocks the connection: allow `node` through Windows Defender Firewall when prompted, or run:

```powershell
New-NetFirewallRule -DisplayName "Weaver dev" -Direction Inbound `
  -LocalPort 8080 -Protocol TCP -Action Allow
```

Service worker / install-to-home-screen won't work over plain HTTP from a non-localhost IP — for that, use option 2 or 3.

### 2. GitHub Pages (one-time setup, sharable URL)

```bash
cd web-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/constellation-weaver.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Source: `main` / `/ (root)`**. Wait ~1 min, your game will be live at `https://<you>.github.io/constellation-weaver/`.

Open that URL on your phone. Because Pages serves over HTTPS, the service worker activates and the game runs offline after the first visit.

### 3. Install as an app on your phone (PWA)

After loading the game over HTTPS (option 2) or `localhost`:

- **iPhone (Safari)**: tap the share icon → **Add to Home Screen**.
- **Android (Chrome)**: tap the three-dot menu → **Install app** (or **Add to Home Screen**).

The icon lands on your home screen and launches in standalone mode (no browser chrome). The service worker keeps the shell cached so it opens instantly even offline.

## Updating after a code change

The service worker uses a versioned cache (`weaver-v1` in `sw.js`). When you ship a meaningful change, bump that string to `weaver-v2` so returning players get the new build instead of the cached one.

## Design references

The original GDD, design brief, and 20 level JSON files live in `docs/`. Levels are also embedded directly into `js/levels.js` so the app runs with no extra fetches.
