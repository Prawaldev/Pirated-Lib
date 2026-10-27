import type { AppState, FilterState, HistoryEntry, SortOption, Site } from '../types'

const PREFIX = 'piralib-'

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function set(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {}
}

export const DEFAULT_FILTERS: FilterState = {
  category: null,
  subcategory: null,
  tags: [],
  sort: 'name-asc',
  query: '',
}

export const DEFAULT_STATE: AppState = {
  theme: 'dark',
  view: 'grid',
  filters: { ...DEFAULT_FILTERS },
  favorites: [],
  history: [],
  recentSearches: [],
  siteNotes: {},
  sidebarOpen: true,
  accentColor: 'blossom',
  blurEnabled: true,
  parallaxEnabled: true,
}

export function loadState(): AppState {
  const storedAccent = get<string>('accent-color', 'blossom')
  return {
    theme: get<'dark' | 'light'>('theme', DEFAULT_STATE.theme),
    view: get<'grid' | 'list' | 'compact'>('view', DEFAULT_STATE.view),
    filters: { ...DEFAULT_FILTERS },
    favorites: get<string[]>('favorites', []),
    history: get<HistoryEntry[]>('history', []),
    recentSearches: get<string[]>('recent-searches', []),
    siteNotes: get<Record<string, string>>('site-notes', {}),
    sidebarOpen: get<boolean>('sidebar-open', true),
    accentColor: storedAccent === 'amber' ? 'blossom' : storedAccent,
    blurEnabled: get<boolean>('blur-enabled', true),
    parallaxEnabled: get<boolean>('parallax-enabled', true),
  }
}

export function saveTheme(theme: 'dark' | 'light') {
  set('theme', theme)
}

export function saveView(view: 'grid' | 'list' | 'compact') {
  set('view', view)
}

export function saveFavorites(ids: string[]) {
  set('favorites', ids)
}

export function saveHistory(entries: HistoryEntry[]) {
  set('history', entries)
}

export function saveRecentSearches(searches: string[]) {
  set('recent-searches', searches)
}

export function saveSiteNotes(notes: Record<string, string>) {
  set('site-notes', notes)
}

export function saveSidebarOpen(open: boolean) {
  set('sidebar-open', open)
}

export function saveAccentColor(color: string) {
  set('accent-color', color)
}

export function saveBlurEnabled(enabled: boolean) {
  set('blur-enabled', enabled)
}

export function saveParallaxEnabled(enabled: boolean) {
  set('parallax-enabled', enabled)
}

function siteFingerprint(s: Site): string {
  let hash = 0
  const str = s.id + '|' + s.name + '|' + s.url + '|' + s.tags.join(',') + '|' + s.category + '|' + s.subcategory
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + ch
    hash |= 0
  }
  return hash.toString(36)
}

export function detectSiteChanges(sites: Site[]): Set<string> {
  const prev = get<Record<string, string>>('site-fingerprints', {})
  const curr: Record<string, string> = {}
  const changed = new Set<string>()

  for (const s of sites) {
    const fp = siteFingerprint(s)
    curr[s.id] = fp
    if (prev[s.id] === undefined) {
      changed.add(s.id)
    } else if (prev[s.id] !== fp) {
      changed.add(s.id)
    }
  }

  set('site-fingerprints', curr)
  return changed
}
