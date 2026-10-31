# Robson Turf website

A redesign of [robsonturf.com.au](http://robsonturf.com.au/) built as a fast, dependency-free static site.

## Structure

```
index.html          Single-page site (all sections)
css/styles.css      Styles
js/main.js          Mobile menu, turf finder, turf calculator, lawn-care tabs, quote form
images/             Hero illustration + favicon (SVG)
```

## Running locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Features

- **Variety comparison**: Buffalo, Couch and Kikuyu with shade / wear / drought / upkeep ratings
- **Turf finder**: three questions → recommended variety
- **Turf calculator**: add rectangles, circles and triangles, with an allowance for cuts; one click copies the result into the quote form
- **Lawn care guide**: soil prep, laying day and first-4-weeks watering schedule
- **Quote form**: validates input, then opens the visitor's email app with a pre-filled request to `info@robsonturf.com.au` (no backend required; swap for Formspree/Netlify Forms etc. if preferred)
- Mobile menu and sticky call/quote bar, LocalBusiness structured data for search, accessible tabs/FAQ, reduced-motion support

## Before going live

Confirm with the business:
- Opening hours (taken from directory listings; phone and email match the current site)
- Facebook / X / Instagram URLs (the current site links to all three; add them to the footer once known)
- Delivery areas
- Variety ratings and wording, and any specific cultivars (e.g. named buffalo varieties) they grow
- Replace the illustration with real farm photos if available
- Host on a provider with HTTPS (e.g. Netlify, Cloudflare Pages, GitHub Pages). The current site is served over plain HTTP, so browsers show a "not secure" warning
