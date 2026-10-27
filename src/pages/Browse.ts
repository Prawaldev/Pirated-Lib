import { el } from '../utils/dom'
import { icon } from '../utils/icons'
import { SiteCard } from '../components/site/SiteCard'
import { SiteListItem } from '../components/site/SiteListItem'
import { SiteCompact } from '../components/site/SiteCompact'
import { FilterBar } from '../components/layout/FilterBar'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { pluralize } from '../utils/format'
import type { Site, Category, FilterState, SortOption } from '../types'

export function BrowsePage(
  sites: Site[],
  categories: Category[],
  filters: FilterState,
  view: 'grid' | 'list' | 'compact',
  favIds: string[],
  onFilterChange: (filters: FilterState) => void,
  onViewChange: (view: 'grid' | 'list' | 'compact') => void,
): HTMLElement {
  const page = el('div', {})

  page.appendChild(Breadcrumbs([
    { label: 'Home', href: '/' },
    { label: 'Browse' },
  ]))

  const header = el('div', { class: 'browse-header' })
  header.appendChild(el('h1', { style: 'font-size:var(--text-2xl);font-weight:700;margin-bottom:var(--space-1);' }, 'Browse Sites'))
  page.appendChild(header)

  const searchInput = el('input', {
    class: 'browse-search-input',
    type: 'text',
    name: 'browse-search',
    placeholder: 'Filter sites by name, description, tags…',
    value: filters.query,
  }) as HTMLInputElement
  let searchTimer: number | undefined
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer)
    searchTimer = window.setTimeout(() => {
      onFilterChange({ ...filters, query: searchInput.value })
    }, 400)
  })
  page.appendChild(searchInput)

  page.appendChild(FilterBar(filters, onFilterChange, onViewChange, view, categories))

  let filtered = [...sites]

  if (filters.query) {
    const q = filters.query.toLowerCase()
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q)) ||
      s.category.includes(q) ||
      s.subcategory.includes(q)
    )
  }

  if (filters.category) {
    filtered = filtered.filter(s => s.category === filters.category)
  }
  if (filters.subcategory) {
    filtered = filtered.filter(s => s.subcategory === filters.subcategory)
  }
  switch (filters.sort) {
    case 'name-asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break
    case 'name-desc': filtered.sort((a, b) => b.name.localeCompare(a.name)); break
    case 'added': filtered.sort((a, b) => b.addedAt.localeCompare(a.addedAt)); break
    case 'updated': filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); break
  }

  const countEl = el('div', { class: 'browse-count' }, `Showing ${pluralize(filtered.length, 'site')}`)
  page.appendChild(countEl)

  if (filtered.length === 0) {
    const empty = el('div', { class: 'empty-state' })
    empty.innerHTML = `<div class="icon">${icon('search', 32)}</div>`
    empty.appendChild(el('div', { class: 'empty-state-title' }, 'No sites match your filters'))
    empty.appendChild(el('div', { class: 'empty-state-desc' }, 'Try adjusting your search or clearing filters.'))
    page.appendChild(empty)
    return page
  }

  if (view === 'grid') {
    const grid = el('div', { class: 'site-grid' })
    filtered.forEach(s => grid.appendChild(SiteCard(s, favIds.includes(s.id))))
    page.appendChild(grid)
  } else if (view === 'list') {
    const list = el('div', { class: 'site-list' })
    filtered.forEach(s => list.appendChild(SiteListItem(s, favIds.includes(s.id))))
    page.appendChild(list)
  } else {
    const compact = el('div', { style: 'background:var(--surface-raised);border-radius:var(--radius);overflow:hidden;' })
    filtered.forEach(s => compact.appendChild(SiteCompact(s)))
    page.appendChild(compact)
  }

  return page
}
