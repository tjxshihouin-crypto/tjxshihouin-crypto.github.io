# TJ — Developer Relations · Personal Portfolio

A personal portfolio for **TJ (TyShawn (TJ) Hill)**. The hero is a live
**ASCII machine** that renders your videos as characters (with a powder-pink
matrix-rain transition), and below it sits a proper portfolio: profile,
capabilities carousel, fun projects, and contact.

Everything runs client-side with **zero dependencies and no build step**.

## Run it

Serve over localhost (needed for the videos):

```bash
cd /Users/tjxshihouin/X/TJxSHIHOUINWebsite
python3 -m http.server 8000
# open http://localhost:8000
```

## What's inside

- **Hero (100vh):** the ASCII reel — your videos play in full, in random order,
  with a powder-pink matrix-rain transition.
- **Profile:** profile picture, name, role, bio chips, all social links, and an
  **Email** button.
- **Capabilities carousel:** switch with **← →** between **Content · DevRel**,
  **GameDev**, and **Fun Projects**. Fun projects pop a description box on
  click.
- **Footer:** NXT-G3NERATION link (opens the consortium info).

### Keyboard

| Key | Action |
|-----|--------|
| `← →` | previous / next category |
| `↑ ↓` / `J` `K` | previous / next video |
| `F` | focus (hide the UI chrome) |
| `P` / `Space` | pause / resume |
| `M` | sound on / off |
| `Esc` / `H` | About panel |
| `S` | share |

## Add / edit your content

**Everything is in [`js/data.js`](js/data.js).**

- **Identity** → `site` (name, role, bio chips, avatar, email, accent).
- **Links** → `site.links`.
- **Categories** → `categories` (Content · DevRel, GameDev, Fun Projects). Add
  items with `name` + `note` (tools) or `name` + `desc` (fun projects).
- **Videos** → `projects` (the ASCII reel).

Drop a new `.mp4` into `assets/` and add it to `projects` — it joins the reel.

## Structure

```
index.html            — shell
css/style.css         — all styling
js/data.js            — ⭐ your content (edit this)
js/util.js            — helpers, state, media loader
js/experiments/ascii.js — the live ASCII machine (video → characters)
js/ui.js              — nav / profile / carousel / footer / modals
js/main.js            — reel loop, categories, keyboard, share
assets/               — videos + profile picture
```
