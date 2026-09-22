# Piralib v1

A curated index of the best anime resources on the internet.

**Piralib** is a premium curated anime discovery platform — an archive and discovery hub for the best anime resources on the web. Every site is hand-picked, reviewed, and maintained by enthusiasts.

## Features

- **550+ curated sites** across 5 categories (Anime, Manga, Novels, Hentai, Tools)
- **Instant fuzzy search** powered by Fuse.js (Ctrl+K to open)
- **Advanced filtering** by category, subcategory, tags, status
- **Multiple view modes**: grid, list, compact
- **Favorites** — save sites to your personal list (localStorage)
- **Browsing history** — recently visited sites with timestamps (localStorage)
- **Personal notes** — private annotations per site (localStorage)
- **Site health monitoring** — client-side status checking with cached results
- **Statistics dashboard** with health breakdown, category distribution, tag cloud
- **Dark & light mode** with persistent preference
- **Keyboard-first navigation** with command palette search

## Tech Stack

- [Vite](https://vitejs.dev/) — Build tool
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Fuse.js](https://fusejs.io/) — Client-side fuzzy search
- Vanilla CSS — No framework, no Tailwind
- JSON — All data in static files
- localStorage — User preferences and personal data
- GitHub Pages — Hosting

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck
```

## Project Structure

```
anilib/
├── index.html              # Entry point
├── public/
│   ├── 404.html            # SPA fallback for GitHub Pages
│   ├── data/               # Static JSON data
│   │   ├── sites.json
│   │   └── categories.json
│   └── images/             # Site screenshots and icons
├── src/
│   ├── types/              # TypeScript interfaces
│   ├── utils/              # Utilities (router, search, storage, etc.)
│   ├── components/         # UI components
│   │   ├── ui/             # Primitives (StatusDot, Tag, Badge, Breadcrumbs)
│   │   ├── layout/         # Layout (Navbar, Sidebar, Footer, FilterBar)
│   │   ├── site/           # Site-specific (SiteCard, SiteListItem, SiteDetail)
│   │   ├── search/         # Search overlay
│   │   └── stats/          # Stats components
│   ├── pages/              # Page renderers (Home, Browse, SiteDetail, etc.)
│   ├── styles/             # CSS (tokens, reset, layout, components, pages)
│   └── main.ts             # Entry point
├── scripts/
│   └── migrate-data.js     # Data migration tool
├── data.js                 # Legacy data file
├── app.js                  # Legacy app file
├── style.css               # Legacy styles
└── README.md
```

## Adding Sites

All site data lives in `public/data/sites.json`. Categories in `public/data/categories.json`.
Simply edit the JSON files and rebuild.

## Deployment

```bash
npm run build
# Deploy dist/ to GitHub Pages
```

