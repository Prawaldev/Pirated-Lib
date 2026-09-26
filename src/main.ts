import './styles/fonts.css'
import './styles/tokens.css'
import './styles/reset.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/pages.css'
import './styles/utilities.css'

import type { Site, Category, AppState, PageName } from './types'
import { loadState, saveTheme, saveView, saveFavorites, saveHistory, saveRecentSearches, saveSiteNotes, saveSidebarOpen, saveAccentColor, saveBlurEnabled, saveParallaxEnabled, detectSiteChanges, DEFAULT_STATE } from './utils/storage'
import { initSearch } from './utils/search'
import { preloadFavicons } from './utils/format'
import { initRouter, registerRoute, navigate, basePath, getCurrentPage, setCurrentPage, getParams } from './utils/router'
import { initKeyboard, onKey } from './utils/keyboard'
import { el, render, qs } from './utils/dom'
import { Navbar } from './components/layout/Navbar'
import { BottomNav } from './components/layout/BottomNav'
import { Footer } from './components/layout/Footer'
import { Sidebar } from './components/layout/Sidebar'
import { SearchOverlay } from './components/search/SearchOverlay'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { HomePage } from './pages/Home'
import { BrowsePage } from './pages/Browse'
import { SiteDetailPage } from './pages/SiteDetailPage'
import { FavoritesPage } from './pages/Favorites'
import { HistoryPage } from './pages/History'
import { DashboardPage } from './pages/Dashboard'
import { AboutPage } from './pages/About'


let sites: Site[] = []
let categories: Category[] = []
let state: AppState
let recentSiteIds: Set<string> | undefined

async function init() {
  state = loadState()

  const [sitesData, catsData] = await Promise.all([
    fetch(basePath('/data/sites.json')).then(r => r.json()),
    fetch(basePath('/data/categories.json')).then(r => r.json()),
  ])
  sites = sitesData as Site[]
  categories = catsData as Category[]

  const root = document.querySelector('#app-slot') as HTMLElement
  if (!root) return

  const navbarSlot = document.querySelector('#navbar-slot') as HTMLElement | null
  const bottomNavSlot = document.querySelector('#bottomnav-slot') as HTMLElement | null
  if (navbarSlot) render(navbarSlot, el('div', {}))
  if (bottomNavSlot) render(bottomNavSlot, el('div', {}))

  recentSiteIds = detectSiteChanges(sites)
  initSearch(sites)
  preloadFavicons(sites.map(s => s.url))
  initKeyboard()

  document.documentElement.setAttribute('data-theme', state.theme)
  applySettings()

  registerRoute(/^\/$/, () => { setCurrentPage('home'); renderPage() })
  registerRoute(/^\/browse(?:\?.*)?$/, (params) => {
    setCurrentPage('browse')
    if (params.category) state.filters.category = params.category
    if (params.subcategory) state.filters.subcategory = params.subcategory
    renderPage()
  })
  registerRoute(/^\/site\?id=(?<id>[^&]+)/, () => { setCurrentPage('site'); renderPage() })
  registerRoute(/^\/favorites\/?$/, () => { setCurrentPage('favorites'); renderPage() })
  registerRoute(/^\/history\/?$/, () => { setCurrentPage('history'); renderPage() })
  registerRoute(/^\/dashboard\/?$/, () => { setCurrentPage('dashboard'); renderPage() })
  registerRoute(/^\/about\/?$/, () => { setCurrentPage('about'); renderPage() })

  onKey('Ctrl+k', (e) => { e.preventDefault(); openSearch() })
  onKey('Escape', () => { closeSearchIfOpen() })

  initRouter()
  navigate('/')
}

let searchOverlay: HTMLElement | null = null
let settingsOverlay: HTMLElement | null = null

function openSearch() {
  if (searchOverlay) return
  searchOverlay = SearchOverlay(sites, state.recentSearches, closeSearch, (query) => {
    state.recentSearches = [query, ...state.recentSearches.filter(s => s !== query)].slice(0, 10)
    saveRecentSearches(state.recentSearches)
  })
  document.body.appendChild(searchOverlay)
  document.body.classList.add('search-open')
}

function closeSearch() {
  if (searchOverlay) {
    searchOverlay.remove()
    searchOverlay = null
    document.body.classList.remove('search-open')
  }
}

function closeSearchIfOpen() {
  if (searchOverlay) closeSearch()
}

function openSettings() {
  if (settingsOverlay) return
  settingsOverlay = SettingsPanel(state, {
    onChangeAccent: (color) => {
      state.accentColor = color
      saveAccentColor(color)
      applySettings()
    },
    onChangeBlur: (enabled) => {
      state.blurEnabled = enabled
      saveBlurEnabled(enabled)
      applySettings()
    },
    onChangeParallax: (enabled) => {
      state.parallaxEnabled = enabled
      saveParallaxEnabled(enabled)
      applySettings()
    },
    onClose: closeSettings,
  })
  document.body.appendChild(settingsOverlay)
}

function closeSettings() {
  if (settingsOverlay) {
    settingsOverlay.remove()
    settingsOverlay = null
  }
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', state.theme)
  saveTheme(state.theme)
  applySettings()
  renderPage()
}

function applySettings() {
  const root = document.documentElement
  root.classList.toggle('reduce-blur', !state.blurEnabled)
  root.classList.toggle('reduce-parallax', !state.parallaxEnabled)

  const accentMap: Record<string, string> = {
    amber: '#d4a373',
    gold: '#e9c46a',
    emerald: '#56d364',
    sky: '#62cff4',
    rose: '#f4717e',
    violet: '#bc8cff',
  }
  const color = accentMap[state.accentColor] || accentMap.amber
  root.style.setProperty('--accent', color)
  root.style.setProperty('--accent-hover', adjustColor(color, 20))
  root.style.setProperty('--accent-dim', adjustColor(color, -40))
  root.style.setProperty('--accent-soft', `color-mix(in srgb, ${color} 20%, transparent)`)
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, ((num >> 16) & 255) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 255) + amount))
  const b = Math.min(255, Math.max(0, (num & 255) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function toggleFav(id: string) {
  const idx = state.favorites.indexOf(id)
  if (idx >= 0) state.favorites.splice(idx, 1)
  else state.favorites.push(id)
  saveFavorites(state.favorites)
  renderPage()
}

function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen
  saveSidebarOpen(state.sidebarOpen)
  updateSidebar()
}

function saveNote(id: string, note: string) {
  state.siteNotes[id] = note
  saveSiteNotes(state.siteNotes)
}

function trackVisit(id: string) {
  const existing = state.history.find(h => h.siteId === id)
  if (existing) {
    existing.visitedAt = Date.now()
    existing.count++
  } else {
    state.history.unshift({ siteId: id, visitedAt: Date.now(), count: 1 })
  }
  saveHistory(state.history.slice(0, 200))
}

function exportFavorites() {
  const favSites = sites.filter(s => state.favorites.includes(s.id))
  const blob = new Blob([JSON.stringify(favSites, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'piralib-favorites.json'
  a.click()
  URL.revokeObjectURL(url)
}

function clearHistory() {
  state.history = []
  saveHistory([])
  renderPage()
}

function updateSidebar() {
  const sidebarEl = document.querySelector('.app-sidebar') as HTMLElement | null
  if (!sidebarEl) return
  if (window.innerWidth > 1023) {
    sidebarEl.style.display = ''
  } else {
    sidebarEl.classList.toggle('open', state.sidebarOpen)
  }
  let backdrop = document.querySelector('.app-sidebar-backdrop') as HTMLElement | null
  if (state.sidebarOpen && window.innerWidth <= 1023) {
    if (!backdrop) {
      backdrop = el('div', { class: 'app-sidebar-backdrop' })
      backdrop.addEventListener('click', toggleSidebar)
      document.body.appendChild(backdrop)
    }
  } else if (backdrop) {
    backdrop.remove()
  }
}

function renderPage() {
  const page = getCurrentPage()
  const params = getParams()

  const root = document.querySelector('#app-slot') as HTMLElement | null
  if (!root) return

  const prevSidebarScroll = document.querySelector('.app-sidebar')?.scrollTop ?? 0

  const navbar = Navbar(page, state.theme, {
    onSearchOpen: openSearch,
    onThemeToggle: toggleTheme,
    onSettingsOpen: openSettings,
    onSidebarToggle: toggleSidebar,
  })

  const bottomNav = BottomNav(page)

  let content: HTMLElement
  let showSidebar = true

  switch (page) {
    case 'home':
      state.filters = { ...DEFAULT_STATE.filters }
      content = HomePage(sites, categories, state.favorites, recentSiteIds)
      showSidebar = false
      break

    case 'browse': {
      content = BrowsePage(sites, categories, state.filters, state.view, state.favorites, (filters) => {
        state.filters = filters
        renderPage()
      }, (view) => {
        state.view = view
        saveView(view)
        renderPage()
      })
      break
    }

    case 'site': {
      const site = sites.find(s => s.id === params.id)
      if (!site) {
        content = el('div', { class: 'empty-state' }, 'Site not found')
      } else {
        trackVisit(site.id)
        content = SiteDetailPage(
          site,
          state.favorites.includes(site.id),
          state.siteNotes[site.id] || '',
          toggleFav,
          saveNote,
          categories,
        )
      }
      showSidebar = false
      break
    }

    case 'favorites': {
      const favSites = sites.filter(s => state.favorites.includes(s.id))
      content = FavoritesPage(favSites, state.view, exportFavorites)
      showSidebar = false
      break
    }

    case 'history':
      content = HistoryPage(sites, state.history, clearHistory)
      showSidebar = false
      break

    case 'dashboard':
      content = DashboardPage(sites, categories, recentSiteIds)
      showSidebar = false
      break

    case 'about':
      content = AboutPage(sites, categories)
      showSidebar = false
      break

    default:
      content = HomePage(sites, categories, state.favorites)
      showSidebar = false
  }

  const layout = el('div', { class: 'app-layout' })

  if (showSidebar) {
    const sidebar = Sidebar(categories, sites, state.filters, (filters) => {
      state.filters = filters
      renderPage()
    }, () => { state.sidebarOpen = false; updateSidebar() })
    sidebar.classList.add('app-sidebar')
    layout.appendChild(sidebar)
  }

  const main = el('main', { class: 'app-main animate-fade-in', role: 'main' })
  main.appendChild(content)
  main.appendChild(Footer(sites.length))
  layout.appendChild(main)

  const navbarSlot = document.querySelector('#navbar-slot') as HTMLElement | null
  const bottomNavSlot = document.querySelector('#bottomnav-slot') as HTMLElement | null
  if (navbarSlot) render(navbarSlot, navbar)
  if (bottomNavSlot) render(bottomNavSlot, bottomNav)

  if (!document.querySelector('.parallax-bg')) {
    const pb = el('div', { class: 'parallax-bg' })
    for (let i = 0; i < 3; i++) pb.appendChild(el('div', { class: 'parallax-circle' }))
    document.body.insertBefore(pb, document.body.firstChild)
  }

  render(root, layout)

  const newSidebar = document.querySelector('.app-sidebar')
  if (newSidebar) newSidebar.scrollTop = prevSidebarScroll
}

document.addEventListener('DOMContentLoaded', init)
