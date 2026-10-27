import { el } from '../utils/dom'
import { icon } from '../utils/icons'
import { SiteCard } from '../components/site/SiteCard'
import { SiteListItem } from '../components/site/SiteListItem'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { navigate } from '../utils/router'
import type { Site } from '../types'

export function FavoritesPage(
  favSites: Site[],
  view: 'grid' | 'list' | 'compact',
  exportFavs: () => void,
): HTMLElement {
  const page = el('div', {})

  page.appendChild(Breadcrumbs([
    { label: 'Home', href: '/' },
    { label: 'Favorites' },
  ]))

  const header = el('div', { class: 'favorites-header' })
  header.innerHTML = `${icon('star', 24)} Favorites (${favSites.length})`
  if (favSites.length > 0) {
    const exportBtn = el('button', { class: 'btn btn-secondary' }, 'Export JSON')
    exportBtn.addEventListener('click', exportFavs)
    header.appendChild(exportBtn)
  }
  page.appendChild(header)

  if (favSites.length === 0) {
    const empty = el('div', { class: 'empty-state' })
    empty.innerHTML = `<div class="icon">${icon('star', 32)}</div>`
    empty.appendChild(el('div', { class: 'empty-state-title' }, 'No favorites yet'))
    empty.appendChild(el('div', { class: 'empty-state-desc' }, 'Save your favorite sites for quick access.'))
    const browseBtn = el('button', { class: 'btn btn-primary' })
    browseBtn.innerHTML = `Browse Sites ${icon('arrowRight')}`
    browseBtn.addEventListener('click', () => navigate('/browse'))
    empty.appendChild(browseBtn)
    page.appendChild(empty)
    return page
  }

  if (view === 'grid') {
    const grid = el('div', { class: 'site-grid' })
    favSites.forEach(s => grid.appendChild(SiteCard(s, true)))
    page.appendChild(grid)
  } else if (view === 'list') {
    const list = el('div', { class: 'site-list' })
    favSites.forEach(s => list.appendChild(SiteListItem(s, true)))
    page.appendChild(list)
  } else {
    const compact = el('div', { style: 'background:var(--surface-raised);border-radius:var(--radius);overflow:hidden;' })
    favSites.forEach(s => {
      const row = el('div', { class: 'site-compact' })
      const starEl = el('span', { style: 'color:var(--accent);display:inline-flex;' })
      starEl.innerHTML = icon('starFilled')
      row.appendChild(starEl)
      row.appendChild(el('span', { class: 'site-compact-name' }, s.name))
      compact.appendChild(row)
    })
    page.appendChild(compact)
  }

  return page
}
